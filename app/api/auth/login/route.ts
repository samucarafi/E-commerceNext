import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sanitizeUser, signUserToken } from "@/lib/auth-server";

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password || password.length > 128) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 400 },
      );
    }

    await connectMongoDB();
    const user = await User.findOne({ email });

    // Mensagem única evita revelar se o e-mail existe.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 401 },
      );
    }

    const token = signUserToken(String(user._id));
    const response = NextResponse.json({
      user: sanitizeUser(user),
    });

    // O JWT não é mais enviado ao JavaScript.
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("POST /api/auth/login:", error);
    return NextResponse.json(
      { error: "Não foi possível realizar o login." },
      { status: 500 },
    );
  }
}
