import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

const types = ["percentage", "fixed", "shipping", "first_purchase"] as const;

export async function GET() {
  try {
    const admin = await getAuthenticatedUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    await connectMongoDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("GET /api/admin/coupons:", error);
    return NextResponse.json({ error: "Erro ao carregar cupons." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const code = String(body.code ?? "").trim().toUpperCase();
    const type = String(body.type ?? "");
    const value = Number(body.value);

    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      return NextResponse.json({ error: "Código inválido. Use letras, números, _ ou -." }, { status: 400 });
    }
    if (!types.includes(type as (typeof types)[number])) {
      return NextResponse.json({ error: "Tipo de cupom inválido." }, { status: 400 });
    }
    if (!Number.isFinite(value) || value < 0 || (type === "percentage" || type === "first_purchase") && value > 100) {
      return NextResponse.json({ error: "Valor de desconto inválido." }, { status: 400 });
    }

    await connectMongoDB();

    const exists = await Coupon.exists({ code });
    if (exists) {
      return NextResponse.json({ error: "Este cupom já existe." }, { status: 409 });
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      active: body.active !== false,
      firstPurchaseOnly: type === "first_purchase" || body.firstPurchaseOnly === true,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/coupons:", error);
    return NextResponse.json({ error: "Erro ao criar cupom." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "Cupom não informado." }, { status: 400 });

    await connectMongoDB();

    const coupon = await Coupon.findById(id);
    if (!coupon) return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });

    if (body.active !== undefined) coupon.active = Boolean(body.active);
    if (body.value !== undefined) {
      const value = Number(body.value);
      if (!Number.isFinite(value) || value < 0 || (coupon.type === "percentage" || coupon.type === "first_purchase") && value > 100) {
        return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
      }
      coupon.value = value;
    }
    if (body.usageLimit !== undefined) {
      coupon.usageLimit = body.usageLimit ? Number(body.usageLimit) : null;
    }
    if (body.expiresAt !== undefined) {
      coupon.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    await coupon.save();
    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("PATCH /api/admin/coupons:", error);
    return NextResponse.json({ error: "Erro ao atualizar cupom." }, { status: 500 });
  }
}
