import mongoose from "mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { getMercadoPagoPayment, MercadoPagoPixPayment } from "@/lib/mercadopago";

export function mapPaymentStatus(status?: string) {
  if (status === "approved") return "approved" as const;
  if (status === "rejected" || status === "cancelled") return "rejected" as const;
  return "pending" as const;
}

async function finalizeApprovedOrder(
  orderId: string,
  paymentId: string,
) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await Order.findOne({ orderId }).session(session);

    if (!order) throw new Error("Pedido não encontrado.");

    // Idempotência: se já foi aprovado, não baixa estoque nem comissão novamente.
    if (order.payment?.status === "approved") {
      await session.commitTransaction();
      return order;
    }

    for (const item of order.items) {
      if (!item.productId) continue;

      const result = await Product.updateOne(
        {
          _id: item.productId,
          stock: { $gte: Number(item.quantity) },
        },
        {
          $inc: { stock: -Number(item.quantity) },
        },
        { session },
      );

      if (result.modifiedCount !== 1) {
        throw new Error(`Estoque insuficiente para o produto ${item.title}.`);
      }
    }

    order.payment.status = "approved";
    order.payment.mpPaymentId = paymentId;

    if (order.coupon?.applied && order.coupon.code) {
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

    if (order.affiliate?.userId && order.affiliate.commissionValue) {
      const commission = Number(order.affiliate.commissionValue);

      await User.updateOne(
        { _id: order.affiliate.userId },
        {
          $inc: {
            "affiliate.totalEarned": commission,
            "affiliate.pendingBalance": commission,
          },
        },
        { session },
      );

      order.affiliate.status = "approved";
    }

    await order.save({ session });
    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function syncOrderPayment(payment: MercadoPagoPixPayment) {
  if (!payment.id) throw new Error("Pagamento do Mercado Pago sem ID.");

  const orderId = payment.external_reference;
  if (!orderId) return null;

  const status = mapPaymentStatus(payment.status);

  if (status === "approved") {
    return finalizeApprovedOrder(orderId, String(payment.id));
  }

  return Order.findOneAndUpdate(
    {
      orderId,
      "payment.status": { $ne: "approved" },
    },
    {
      $set: {
        "payment.status": status,
        "payment.mpPaymentId": String(payment.id),
      },
    },
    { new: true },
  );
}

export async function refreshOrderPayment(orderId: string) {
  const order = await Order.findOne({ orderId }).lean();

  if (!order) throw new Error("Pedido não encontrado.");
  if (!order.payment?.mpPaymentId) return order;

  const payment = await getMercadoPagoPayment(order.payment.mpPaymentId);
  await syncOrderPayment(payment);

  return Order.findOne({ orderId }).lean();
}
