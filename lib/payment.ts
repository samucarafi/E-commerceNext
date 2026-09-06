import mongoose from "mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { getMercadoPagoPayment } from "@/lib/mercadopago";
import {
  sendAdminPaymentApprovedEmail,
  sendPaymentApprovedEmail,
} from "@/lib/email";

type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired";

type MercadoPagoPayment = {
  id: string | number;
  status?: string;
  status_detail?: string;
  external_reference?: string;
};

type ApprovedOrder = {
  orderId: string;
  customer: { name: string; email: string };
  items: Array<{
    title?: string;
    quantity?: number;
    unit_price?: number;
  }>;
  totals: {
    subtotal?: number;
    discount?: number;
    shipping?: number;
    total?: number;
  };
  shippingAddress?: {
    cep?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    complement?: string;
  };
  payment?: {
    method?: string;
    status?: string;
    mpPaymentId?: string;
  };
  newlyApproved: boolean;
};

function mapPaymentStatus(status?: string): PaymentStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled") return "cancelled";
  if (status === "expired") return "expired";
  return "pending";
}

function emailOrder(order: ApprovedOrder) {
  if (!order.newlyApproved) return;

  Promise.all([
    sendPaymentApprovedEmail(order),
    sendAdminPaymentApprovedEmail(order),
  ]).catch((error) => {
    console.error(
      "Pagamento aprovado, mas um ou mais e-mails não foram enviados:",
      error,
    );
  });
}

export async function finalizeApprovedOrder(
  orderId: string,
  paymentId: string,
) {
  const session = await mongoose.startSession();
  let result: ApprovedOrder | null = null;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ orderId }).session(session);

      if (!order) {
        throw new Error("Pedido não encontrado.");
      }

      if (order.payment?.status === "approved") {
        result = {
          orderId: order.orderId,
          customer: order.customer,
          items: order.items ?? [],
          totals: order.totals,
          shippingAddress: order.shippingAddress,
          payment: order.payment,
          newlyApproved: false,
        };
        return;
      }

      for (const item of order.items ?? []) {
        const updated = await Product.updateOne(
          {
            _id: item.productId,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session },
        );

        if (updated.modifiedCount !== 1) {
          throw new Error(
            `Estoque insuficiente para o produto ${item.title ?? item.productId}.`,
          );
        }
      }

      order.payment.status = "approved";
      order.payment.mpPaymentId = paymentId;
      order.deliveryStatus = "processing";

      if (order.coupon?.applied && order.coupon?.code) {
        await User.updateOne(
          {
            _id: order.userId,
            "usedCoupons.code": { $ne: order.coupon.code },
          },
          {
            $push: {
              usedCoupons: {
                code: order.coupon.code,
                usedAt: new Date(),
              },
            },
          },
          { session },
        );
      }

      if (order.affiliate?.userId && order.affiliate?.commissionValue) {
        await User.updateOne(
          { _id: order.affiliate.userId },
          {
            $inc: {
              "affiliate.totalEarned": order.affiliate.commissionValue,
              "affiliate.pendingBalance":
                order.affiliate.commissionValue,
            },
          },
          { session },
        );

        order.affiliate.status = "approved";
      }

      await order.save({ session });

      result = {
        orderId: order.orderId,
        customer: order.customer,
        items: order.items ?? [],
        totals: order.totals,
        shippingAddress: order.shippingAddress,
        payment: order.payment,
        newlyApproved: true,
      };
    });

    if (result) emailOrder(result);
    return result;
  } finally {
    await session.endSession();
  }
}

export async function syncOrderPayment(
  orderId: string,
  paymentId: string,
  status: PaymentStatus,
) {
  if (status === "approved") {
    return finalizeApprovedOrder(orderId, paymentId);
  }

  return Order.findOneAndUpdate(
    {
      orderId,
      "payment.status": { $ne: "approved" },
    },
    {
      $set: {
        "payment.status": status,
        "payment.mpPaymentId": paymentId,
      },
    },
    { new: true },
  );
}

export async function refreshOrderPayment(orderId: string) {
  const order = (await Order.findOne({ orderId }).lean()) as {
    payment?: {
      status?: PaymentStatus;
      mpPaymentId?: string;
    };
  } | null;

  if (!order) {
    throw new Error("Pedido não encontrado.");
  }

  if (
    order.payment?.status === "approved" &&
    order.payment?.mpPaymentId
  ) {
    return order;
  }

  if (!order.payment?.mpPaymentId) {
    return order;
  }

  const payment =
    (await getMercadoPagoPayment(
      order.payment.mpPaymentId,
    )) as MercadoPagoPayment;

  return syncOrderPayment(
    orderId,
    String(payment.id),
    mapPaymentStatus(payment.status),
  );
}

export async function refreshPaymentById(paymentId: string) {
  const payment =
    (await getMercadoPagoPayment(paymentId)) as MercadoPagoPayment;

  if (!payment.external_reference) {
    throw new Error("Pagamento sem referência externa.");
  }

  return syncOrderPayment(
    payment.external_reference,
    String(payment.id),
    mapPaymentStatus(payment.status),
  );
}
