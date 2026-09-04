import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import User from "@/models/User";
import { connectMongoDB } from "@/lib/mongodb";
import { signUserToken, sanitizeUser } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Token do Google não informado." },
        { status: 400 },
      );
    }

    const client = new OAuth2Client();
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Token do Google inválido." },
        { status: 401 },
      );
    }

    const googleUser = await response.json();

    if (!googleUser.email || !googleUser.email_verified) {
      return NextResponse.json(
        { error: "A conta Google precisa possuir e-mail verificado." },
        { status: 401 },
      );
    }

    await connectMongoDB();

    let user = await User.findOne({
      email: googleUser.email.toLowerCase().trim(),
    });

    if (!user) {
      user = await User.create({
        name: googleUser.name || "Cliente Royal",
        email: googleUser.email.toLowerCase().trim(),
        password: null,
        verified: true,
        role: "user",
        affiliate: {
          couponCode: `${String(googleUser.name || "ROYAL")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z]/g, "")
            .toUpperCase()
            .slice(0, 8)}${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
    } else if (!user.verified) {
      user.verified = true;
      await user.save();
    }

    const token = signUserToken({
      _id: String(user._id),
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      message: "Login com Google realizado com sucesso.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("POST /api/auth/google:", error);
    return NextResponse.json(
      { error: "Erro ao autenticar com Google." },
      { status: 500 },
    );
  }
}
