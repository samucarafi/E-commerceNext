import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";
import { signEmailVerificationToken } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email =
      body && typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        message: "Se a conta existir, enviaremos um novo e-mail.",
      });
    }

    if (user.verified) {
      return NextResponse.json({
        message: "Esta conta já está verificada.",
      });
    }

    if (
      user.lastVerificationEmail &&
      Date.now() - new Date(user.lastVerificationEmail).getTime() < 60_000
    ) {
      return NextResponse.json(
        { error: "Aguarde 1 minuto antes de solicitar outro e-mail." },
        { status: 429 },
      );
    }

    const token = signEmailVerificationToken(String(user._id));
    await sendVerificationEmail(user.email, token);

    user.lastVerificationEmail = new Date();
    await user.save();

    return NextResponse.json({
      message: "Um novo e-mail de verificação foi enviado.",
    });
  } catch (error) {
    console.error("POST /api/auth/resend-verification:", error);
    return NextResponse.json(
      { error: "Não foi possível reenviar o e-mail de verificação." },
      { status: 500 },
    );
  }
}
