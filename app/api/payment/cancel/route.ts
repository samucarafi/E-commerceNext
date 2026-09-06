import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth-server";
import Order from "@/models/Order";
import { cancelMercadoPagoPayment, getMercadoPagoPayment } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const { orderId } = (await request.json()) as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: "orderId é obrigatório." }, { status: 400 });

    await connectMongoDB();
    const order = await Order.findOne({ orderId, userId: user._id });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    if (order.payment?.status === "approved") return NextResponse.json({ error: "Não é possível cancelar um pedido já pago." }, { status: 409 });

    if (order.payment?.mpPaymentId) {
      const current = await getMercadoPagoPayment(order.payment.mpPaymentId);
      if (current.status === "pending" || current.status === "in_process") {
        await cancelMercadoPagoPayment(order.payment.mpPaymentId);
      }
    }

    order.payment.status = "cancelled";
    await order.save();
    return NextResponse.json({ orderId: order.orderId, status: order.payment.status });
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível cancelar o pedido." }, { status: 400 });
  }
}
