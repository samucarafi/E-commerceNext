import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { createToken } from "@/lib/auth-server";

type GoogleUserInfo = {
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: "Token do Google não informado." },
        { status: 400 },
      );
    }

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Token do Google inválido." },
        { status: 401 },
      );
    }

    const googleUser = (await response.json()) as GoogleUserInfo;

    if (!googleUser.email || googleUser.verified_email === false) {
      return NextResponse.json(
        { error: "Não foi possível validar o e-mail do Google." },
        { status: 401 },
      );
    }

    const email = googleUser.email.toLowerCase().trim();

    let user = await User.findOne({ email });

    if (!user) {
      // Conta criada via Google não utiliza senha.
      // Mantemos um hash aleatório apenas para satisfazer modelos
      // que ainda tenham password como campo obrigatório.
      const unusablePassword = await bcrypt.hash(
        `${crypto.randomUUID()}-${access_token}`,
        10,
      );

      user = await User.create({
        name: googleUser.name || email.split("@")[0],
        email,
        password: unusablePassword,
        role: "user",
        verified: true,
      });
    }

    const token = createToken({
      _id: String(user._id),
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("Erro no login com Google:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao autenticar com Google.",
      },
      { status: 500 },
    );
  }
}
