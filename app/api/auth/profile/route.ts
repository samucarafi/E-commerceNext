import { NextResponse } from "next/server";
import { getAuthenticatedUser, sanitizeUser } from "@/lib/auth-server";

const allowedAddressKeys = [
  "cep",
  "street",
  "number",
  "neighborhood",
  "city",
  "state",
  "complement",
] as const;

function cleanAddress(input: unknown) {
  if (!input || typeof input !== "object") return null;

  const source = input as Record<string, unknown>;
  const address: Record<string, string> = {};

  for (const key of allowedAddressKeys) {
    const value = source[key];
    if (typeof value === "string") address[key] = value.trim();
  }

  return address;
}

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  return NextResponse.json({ user: sanitizeUser(user) });
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (typeof data.name === "string") {
    const name = data.name.trim();

    if (name.length < 3) {
      return NextResponse.json(
        { error: "O nome deve ter pelo menos 3 caracteres." },
        { status: 400 },
      );
    }

    user.name = name;
  }

  if (typeof data.phone === "string") {
    user.phone = data.phone.trim();
  }

  if (Array.isArray(data.addresses)) {
    const addresses = data.addresses
      .map(cleanAddress)
      .filter((address): address is Record<string, string> => Boolean(address));

    user.addresses = addresses as typeof user.addresses;
  }

  await user.save();

  return NextResponse.json({
    message: "Perfil atualizado com sucesso.",
    user: sanitizeUser(user),
  });
}
