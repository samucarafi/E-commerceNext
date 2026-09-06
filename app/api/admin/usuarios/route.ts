import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth-server";

async function requireAdmin() {
  const user = await getAuthenticatedUser();
  return user?.role === "admin" ? user : null;
}

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    await connectMongoDB();
    const users = await User.find({})
      .select("name email role verified createdAt phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(users, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os usuários." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const source = body as Record<string, unknown>;
    const name = typeof source.name === "string" ? source.name.trim() : "";
    const email =
      typeof source.email === "string"
        ? source.email.trim().toLowerCase()
        : "";
    const password =
      typeof source.password === "string" ? source.password : "";
    const role = source.role === "admin" ? "admin" : "user";
    const verified = source.verified !== false;

    if (name.length < 3 || name.length > 100) {
      return NextResponse.json(
        { error: "O nome deve ter entre 3 e 100 caracteres." },
        { status: 400 },
      );
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "A senha deve ter entre 6 e 128 caracteres." },
        { status: 400 },
      );
    }

    await connectMongoDB();

    if (await User.exists({ email })) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
      verified,
    });

    return NextResponse.json(
      {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/usuarios:", error);
    return NextResponse.json(
      { error: "Não foi possível criar o usuário." },
      { status: 500 },
    );
  }
}
