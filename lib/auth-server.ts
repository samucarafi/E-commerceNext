import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres.");
  }
  return secret;
}

type TokenPayload = { id?: string; _id?: string };

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as TokenPayload;

    const userId = payload.id ?? payload._id;
    if (!userId || typeof userId !== "string") return null;

    await connectMongoDB();

    // O contexto de autenticação nunca carrega senha, CPF ou outros segredos.
    return User.findById(userId).select(
      "name email role verified phone addresses",
    );
  } catch {
    return null;
  }
}

export function signUserToken(userId: string) {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

export function sanitizeUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role?: string;
  verified?: boolean;
  phone?: string;
  addresses?: unknown[];
}) {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified,
    phone: user.phone,
    addresses: user.addresses ?? [],
  };
}
