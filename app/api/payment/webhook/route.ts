import { NextResponse } from "next/server";
import { refreshOrderPayment } from "@/lib/payment";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mercado Pago pode enviar diferentes formatos de notificação.
    // O ID do pagamento pode vir diretamente em data.id ou como query parameter.
    const paymentId =
      body?.data?.id ??
      body?.id ??
      new URL(request.url).searchParams.get("data.id") ??
      new URL(request.url).searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const result = await refreshOrderPayment(String(paymentId));
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error("Erro no webhook de pagamento:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
