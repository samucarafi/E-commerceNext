import mongoose from "mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { getMercadoPagoPayment } from "@/lib/mercadopago";

type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled" | "expired";
type MercadoPagoPayment = { id: string | number; status?: string; status_detail?: string; external_reference?: string };

function mapPaymentStatus(status?: string): PaymentStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled") return "cancelled";
  if (status === "expired") return "expired";
  return "pending";
}

export async function finalizeApprovedOrder(orderId: string, paymentId: string) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const order = await Order.findOne({ orderId }).session(session);
      if (!order) throw new Error("Pedido não encontrado.");
      if (order.payment?.status === "approved") { result = order; return; }

      for (const item of order.items ?? []) {
        const updated = await Product.updateOne({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { session });
        if (updated.modifiedCount !== 1) throw new Error(`Estoque insuficiente para o produto ${item.title ?? item.productId}.`);
      }

      order.payment.status = "approved";
      order.payment.mpPaymentId = paymentId;

      if (order.coupon?.applied && order.coupon?.code) {
        await User.updateOne(
          { _id: order.userId, "usedCoupons.code": { $ne: order.coupon.code } },
          { $push: { usedCoupons: { code: order.coupon.code, usedAt: new Date() } } },
          { session },
        );
      }

      if (order.affiliate?.userId && order.affiliate?.commissionValue) {
        await User.updateOne(
          { _id: order.affiliate.userId },
          { $inc: { "affiliate.totalEarned": order.affiliate.commissionValue, "affiliate.pendingBalance": order.affiliate.commissionValue } },
          { session },
        );
        order.affiliate.status = "approved";
      }
      await order.save({ session });
      result = order;
    });
    return result;
  } finally { await session.endSession(); }
}

export async function syncOrderPayment(orderId: string, paymentId: string, status: PaymentStatus) {
  if (status === "approved") return finalizeApprovedOrder(orderId, paymentId);
  return Order.findOneAndUpdate(
    { orderId, "payment.status": { $ne: "approved" } },
    { $set: { "payment.status": status, "payment.mpPaymentId": paymentId } },
    { new: true },
  );
}

export async function refreshOrderPayment(orderId: string) {
  const order = await Order.findOne({ orderId }).lean();
  if (!order) throw new Error("Pedido não encontrado.");
  if (order.payment?.status === "approved" && order.payment?.mpPaymentId) return order;
  if (!order.payment?.mpPaymentId) return order;
  const payment = await getMercadoPagoPayment(order.payment.mpPaymentId) as MercadoPagoPayment;
  return syncOrderPayment(orderId, String(payment.id), mapPaymentStatus(payment.status));
}

export async function refreshPaymentById(paymentId: string) {
  const payment = await getMercadoPagoPayment(paymentId) as MercadoPagoPayment;
  if (!payment.external_reference) throw new Error("Pagamento sem referência externa.");
  return syncOrderPayment(payment.external_reference, String(payment.id), mapPaymentStatus(payment.status));
}
