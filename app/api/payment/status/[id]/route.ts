import { NextResponse } from "next/server";
import { refreshOrderPayment } from "@/lib/payment";
import { getAuthenticatedUser } from "@/lib/auth-server";
import Order from "@/models/Order";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ message: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  try {
    const order = await Order.findOne({ orderId: id, userId: user._id });
    if (!order) return NextResponse.json({ message: "Pedido não encontrado." }, { status: 404 });

    const result = await refreshOrderPayment(id);
    return NextResponse.json({
      status: result?.payment?.status ?? order.payment?.status,
      dateOfExpiration: result?.payment?.dateOfExpiration,
    });
  } catch (error) {
    console.error("Erro ao consultar status do pagamento:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Erro ao consultar pagamento." }, { status: 400 });
  }
}
