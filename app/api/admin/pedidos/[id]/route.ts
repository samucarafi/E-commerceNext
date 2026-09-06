import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendOrderStatusEmail } from "@/lib/email";

const allowedStatuses = new Set(["processing", "sent", "delivered"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const status = typeof body?.deliveryStatus === "string" ? body.deliveryStatus : "";

    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Status de entrega inválido." }, { status: 400 });
    }

    await connectMongoDB();
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    if (order.payment?.status !== "approved") {
      return NextResponse.json(
        { error: "O pedido só pode entrar em preparação após o pagamento ser aprovado." },
        { status: 409 },
      );
    }

    if (order.deliveryStatus === status) {
      return NextResponse.json({ order });
    }

    order.deliveryStatus = status as "processing" | "sent" | "delivered";
    await order.save();

    try {
      await sendOrderStatusEmail({
        orderId: order.orderId,
        customer: order.customer,
        status: order.deliveryStatus,
      });
    } catch (emailError) {
      console.error("Status atualizado, mas o e-mail não foi enviado:", emailError);
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("PATCH /api/admin/pedidos/[id]:", error);
    return NextResponse.json({ error: "Não foi possível atualizar o pedido." }, { status: 500 });
  }
}
