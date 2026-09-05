import { NextResponse } from "next/server";
import { syncOrderPayment } from "@/lib/payment";
import { getAuthenticatedUser } from "@/lib/auth-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await syncOrderPayment(id, user._id.toString(), user.role);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao consultar status do pagamento:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao consultar pagamento." },
      { status: 400 },
    );
  }
}
