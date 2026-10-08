import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

const types = ["percentage", "fixed", "shipping", "first_purchase"] as const;

function parseOptionalLimit(value: unknown, label: string): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${label} deve ser um número inteiro maior que zero.`);
  }
  return parsed;
}

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
    const active = body.active !== false;
    const showOnHome = body.showOnHome === true;

    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      return NextResponse.json({ error: "Código inválido. Use letras, números, _ ou -." }, { status: 400 });
    }
    if (!types.includes(type as (typeof types)[number])) {
      return NextResponse.json({ error: "Tipo de cupom inválido." }, { status: 400 });
    }
    if (!Number.isFinite(value) || value < 0 || ((type === "percentage" || type === "first_purchase") && value > 100)) {
      return NextResponse.json({ error: "Valor de desconto inválido." }, { status: 400 });
    }
    if (showOnHome && !active) {
      return NextResponse.json({ error: "Ative o cupom antes de destacá-lo na home." }, { status: 400 });
    }

    let usageLimit: number | null;
    let perUserLimit: number | null;
    try {
      usageLimit = parseOptionalLimit(body.usageLimit, "Limite total");
      perUserLimit = parseOptionalLimit(body.perUserLimit, "Limite por usuário");
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Limite de uso inválido." },
        { status: 400 },
      );
    }

    if (body.expiresAt && (typeof body.expiresAt !== "string" || Number.isNaN(new Date(body.expiresAt).getTime()))) {
      return NextResponse.json({ error: "Data de expiração inválida." }, { status: 400 });
    }

    await connectMongoDB();
    if (await Coupon.exists({ code })) {
      return NextResponse.json({ error: "Este cupom já existe." }, { status: 409 });
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      active,
      showOnHome: false,
      firstPurchaseOnly: type === "first_purchase" || body.firstPurchaseOnly === true,
      usageLimit,
      perUserLimit,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });

    if (showOnHome) {
      await Coupon.updateMany({ _id: { $ne: coupon._id } }, { $set: { showOnHome: false } });
      coupon.showOnHome = true;
      await coupon.save();
    }

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

    if (body.showOnHome !== undefined) {
      const showOnHome = Boolean(body.showOnHome);
      if (showOnHome && !coupon.active) {
        return NextResponse.json({ error: "Ative o cupom antes de destacá-lo na home." }, { status: 400 });
      }
      if (showOnHome) {
        await Coupon.updateMany({ _id: { $ne: coupon._id } }, { $set: { showOnHome: false } });
      }
      coupon.showOnHome = showOnHome;
    }

    if (body.active !== undefined) {
      coupon.active = Boolean(body.active);
      if (!coupon.active) coupon.showOnHome = false;
    }

    if (body.value !== undefined) {
      const value = Number(body.value);
      if (!Number.isFinite(value) || value < 0 || ((coupon.type === "percentage" || coupon.type === "first_purchase") && value > 100)) {
        return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
      }
      coupon.value = value;
    }

    if (body.usageLimit !== undefined) {
      try {
        coupon.usageLimit = parseOptionalLimit(body.usageLimit, "Limite total");
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Limite total inválido." },
          { status: 400 },
        );
      }
    }

    if (body.perUserLimit !== undefined) {
      try {
        coupon.perUserLimit = parseOptionalLimit(body.perUserLimit, "Limite por usuário");
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Limite por usuário inválido." },
          { status: 400 },
        );
      }
    }

    if (body.expiresAt !== undefined) {
      if (body.expiresAt && (typeof body.expiresAt !== "string" || Number.isNaN(new Date(body.expiresAt).getTime()))) {
        return NextResponse.json({ error: "Data de expiração inválida." }, { status: 400 });
      }
      coupon.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    await coupon.save();
    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("PATCH /api/admin/coupons:", error);
    return NextResponse.json({ error: "Erro ao atualizar cupom." }, { status: 500 });
  }
}
