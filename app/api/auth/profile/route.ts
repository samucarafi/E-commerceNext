import { NextResponse } from "next/server";
import { getAuthenticatedUser, sanitizeUser } from "@/lib/auth-server";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  return NextResponse.json({ user: sanitizeUser(user) });
}
