import { NextResponse } from "next/server";
import { refreshPaymentById } from "@/lib/payment";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = new URL(request.url);
    const paymentId = body?.data?.id ?? body?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

    if (!paymentId) return NextResponse.json({ received: true });

    await refreshPaymentById(String(paymentId));
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook de pagamento:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
