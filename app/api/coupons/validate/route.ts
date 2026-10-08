import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Coupon from "@/models/Coupon";

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
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Cupom não informado." },
        { status: 400 },
      );
    }

    await connectMongoDB();

    const couponCode = code.trim().toUpperCase();

    const affiliateUser = (await User.findOne({
      "affiliate.couponCode": couponCode,
    }).lean()) as unknown as AffiliateUser | null;

    if (affiliateUser) {
      if (String(affiliateUser._id) === String(user._id)) {
        return NextResponse.json(
          { error: "Você não pode usar seu próprio cupom." },
          { status: 400 },
        );
      }

      return NextResponse.json({
        coupon: {
          code: couponCode,
          type: "affiliate",
          value: Number(affiliateUser.affiliate?.discountPercentage || 0),
        },
      });
    }

    const storedCoupon = await Coupon.findOne({ code: couponCode }).lean();

    if (!storedCoupon) {
      return NextResponse.json(
        { error: "Cupom inválido." },
        { status: 404 },
      );
    }

    if (!storedCoupon.active) {
      return NextResponse.json({ error: "Este cupom está inativo." }, { status: 400 });
    }

    if (storedCoupon.expiresAt && new Date(storedCoupon.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Este cupom expirou." }, { status: 400 });
    }

    if (storedCoupon.usageLimit !== null && storedCoupon.usageLimit !== undefined && storedCoupon.usageCount >= storedCoupon.usageLimit) {
      return NextResponse.json({ error: "Este cupom atingiu o limite de uso." }, { status: 400 });
    }

    if (storedCoupon.perUserLimit !== null && storedCoupon.perUserLimit !== undefined) {
      const userUses = await Order.countDocuments({ userId: user._id, "coupon.code": couponCode, "coupon.applied": true, "payment.status": "approved" });
      if (userUses >= storedCoupon.perUserLimit) {
        return NextResponse.json({ error: "Você já atingiu o limite de uso deste cupom." }, { status: 400 });
      }
    }

    if (storedCoupon.firstPurchaseOnly || storedCoupon.type === "first_purchase") {
      const previousOrder = await Order.findOne({
        userId: user._id,
        "payment.status": "approved",
      }).lean();

      if (previousOrder) {
        return NextResponse.json(
          { error: "Este cupom é válido apenas no primeiro pedido." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({
      coupon: {
        code: storedCoupon.code,
        type: storedCoupon.type,
        value: Number(storedCoupon.value),
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
