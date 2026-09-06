import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyEmailVerificationToken } from "@/lib/verification";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();

  const loginUrl = new URL("/login", url.origin);

  if (!token) {
    loginUrl.searchParams.set("verification", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const userId = verifyEmailVerificationToken(token);
    await connectMongoDB();

    const user = await User.findById(userId);
    if (!user) {
      loginUrl.searchParams.set("verification", "invalid");
      return NextResponse.redirect(loginUrl);
    }

    user.verified = true;
    await user.save();

    loginUrl.searchParams.set("verification", "success");
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("Erro ao verificar e-mail:", error);
    loginUrl.searchParams.set("verification", "invalid");
    return NextResponse.redirect(loginUrl);
  }
}
