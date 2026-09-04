import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { hashCpf } from "@/lib/cpf";

type AffiliateData = {
  couponCode?: string;
  discountPercentage?: number;
};

type AffiliateUser = {
  _id: unknown;
  affiliate?: AffiliateData;
};

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const { code, cpf } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Cupom não informado." },
        { status: 400 },
      );
    }

    await connectMongoDB();

    const couponCode = code.trim().toUpperCase();

    if (couponCode === "PRIMEIRACOMPRA") {
      if (!cpf) {
        return NextResponse.json(
          {
            error: "Informe seu CPF para usar o cupom PRIMEIRACOMPRA.",
            requiresCpf: true,
          },
          { status: 400 },
        );
      }

      const cpfHash = hashCpf(cpf);

      const alreadyUsed = await Order.findOne({
        "coupon.code": "PRIMEIRACOMPRA",
        "coupon.cpfHash": cpfHash,
        "payment.status": "approved",
      }).lean();

      if (alreadyUsed) {
        return NextResponse.json(
          { error: "Este CPF já utilizou o cupom PRIMEIRACOMPRA." },
          { status: 400 },
        );
      }

      return NextResponse.json({
        coupon: {
          code: couponCode,
          type: "percentage",
          value: 10,
        },
      });
    }

    const affiliateUser = (await User.findOne({
      "affiliate.couponCode": couponCode,
    }).lean()) as AffiliateUser | null;

    if (!affiliateUser) {
      return NextResponse.json(
        { error: "Cupom inválido." },
        { status: 404 },
      );
    }

    if (String(affiliateUser._id) === String(user._id)) {
      return NextResponse.json(
        { error: "Você não pode usar seu próprio cupom." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      coupon: {
        code: affiliateUser.affiliate?.couponCode,
        type: "affiliate",
        value: Number(affiliateUser.affiliate?.discountPercentage || 0),
      },
    });
  } catch (error) {
    console.error("POST /api/coupons/validate:", error);
    return NextResponse.json(
      { error: "Erro ao validar cupom." },
      { status: 500 },
    );
  }
}
