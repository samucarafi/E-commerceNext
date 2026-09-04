import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import { createPendingOrder } from "@/lib/checkout";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const body = await request.json();

    await connectMongoDB();

    const result = await createPendingOrder(body, user._id);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/checkout:", error);

    const message =
      error instanceof SyntaxError
        ? "JSON inválido."
        : error?.message || "Erro ao criar pedido.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
