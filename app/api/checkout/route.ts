import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createPendingOrder } from "@/lib/checkout";
import { sendOrderCreatedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const result = await createPendingOrder(body, String(user._id));

    try {
      await sendOrderCreatedEmail({
        orderId: result.orderId,
        customer: result.customer,
        total: result.total,
      });
    } catch (emailError) {
      console.error("Pedido criado, mas o e-mail não foi enviado:", emailError);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/checkout:", error);

    const message =
      error instanceof SyntaxError
        ? "JSON inválido."
        : error instanceof Error
          ? error.message
          : "Erro ao criar pedido.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
