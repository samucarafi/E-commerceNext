import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sanitizeUser, signUserToken } from "@/lib/auth-server";
import { generateUniqueAffiliateCoupon } from "@/lib/affiliate";

type GoogleUserInfo = {
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
};

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const accessToken =
      typeof body?.accessToken === "string"
        ? body.accessToken.trim()
        : typeof body?.access_token === "string"
          ? body.access_token.trim()
          : "";

    if (!accessToken || accessToken.length > 4096) {
      return NextResponse.json(
        { error: "Token do Google não informado." },
        { status: 400 },
      );
    }

    const googleResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (!googleResponse.ok) {
      return NextResponse.json(
        { error: "Token do Google inválido." },
        { status: 401 },
      );
    }

    const googleUser = (await googleResponse.json()) as GoogleUserInfo;

    if (!googleUser.email || googleUser.verified_email === false) {
      return NextResponse.json(
        { error: "Não foi possível validar o e-mail do Google." },
        { status: 401 },
      );
    }

    await connectMongoDB();

    const email = googleUser.email.toLowerCase().trim();
    let user = await User.findOne({ email });

    if (!user) {
      const unusablePassword = await bcrypt.hash(
        `${crypto.randomUUID()}-${crypto.randomUUID()}`,
        10,
      );

      const couponCode = await generateUniqueAffiliateCoupon(
        googleUser.name || email.split("@")[0],
      );

      user = await User.create({
        name: googleUser.name || email.split("@")[0],
        email,
        password: unusablePassword,
        role: "user",
        verified: true,
        affiliate: {
          couponCode,
          discountPercentage: 5,
          commissionPercentage: 5,
        },
      });
    } else if (!user.affiliate?.couponCode) {
      user.affiliate = {
        couponCode: await generateUniqueAffiliateCoupon(user.name),
        discountPercentage: Number(user.affiliate?.discountPercentage ?? 5),
        commissionPercentage: Number(user.affiliate?.commissionPercentage ?? 5),
        totalEarned: Number(user.affiliate?.totalEarned ?? 0),
        pendingBalance: Number(user.affiliate?.pendingBalance ?? 0),
        totalPaid: Number(user.affiliate?.totalPaid ?? 0),
      };
      user.verified = true;
      await user.save();
    }

    const token = signUserToken(String(user._id));
    const response = NextResponse.json({
      user: sanitizeUser(user),
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: unknown) {
    console.error("Erro no login com Google:", error);
    return NextResponse.json(
      { error: "Erro ao autenticar com Google." },
      { status: 500 },
    );
  }
}
