import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 },
      );
    }

    const source = body as Record<string, unknown>;
    const name = typeof source.name === "string" ? source.name.trim() : "";
    const email =
      typeof source.email === "string"
        ? source.email.trim().toLowerCase()
        : "";
    const password =
      typeof source.password === "string" ? source.password : "";

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
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 },
      );
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "A senha deve ter entre 6 e 128 caracteres." },
        { status: 400 },
      );
    }

    await connectMongoDB();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso." },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/auth/register:", error);
    return NextResponse.json(
      { error: "Não foi possível criar a conta." },
      { status: 500 },
    );
  }
}
