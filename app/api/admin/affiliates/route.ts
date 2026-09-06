import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import AffiliateConfig from "@/models/AffiliateConfig";

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
}

function percentage(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 100 ? number : fallback;
}

export async function GET() {
  try {
    const admin = await getAuthenticatedUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    await connectMongoDB();

    const users = await User.find({
      "affiliate.couponCode": { $exists: true, $ne: null },
    })
      .select("name email role affiliate createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const commissionTotals = await Order.aggregate([
      {
        $match: {
          "platformCommission.status": { $in: ["approved", "paid"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$platformCommission.value", 0] } },
          paid: {
            $sum: {
              $cond: [
                { $eq: ["$platformCommission.status", "paid"] },
                { $ifNull: ["$platformCommission.value", 0] },
                0,
              ],
            },
          },
          pending: {
            $sum: {
              $cond: [
                { $eq: ["$platformCommission.status", "approved"] },
                { $ifNull: ["$platformCommission.value", 0] },
                0,
              ],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      affiliates: users,
      platformCommission: commissionTotals[0] ?? { total: 0, paid: 0, pending: 0 },
    });
  } catch (error) {
    console.error("GET /api/admin/affiliates:", error);
    return NextResponse.json({ error: "Erro ao carregar afiliados." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Informe o e-mail do afiliado." }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const config = await AffiliateConfig.findOne().sort({ createdAt: -1 }).lean();
    const defaultDiscount = Number(config?.affiliateDefaultDiscountPercentage ?? 5);
    const defaultCommission = Number(config?.affiliateDefaultCommissionPercentage ?? 5);

    const requestedCode = normalizeCode(String(body.couponCode ?? ""));
    const code = requestedCode || `ROYAL-${String(user._id).slice(-6).toUpperCase()}`;

    const existing = await User.findOne({
      "affiliate.couponCode": code,
      _id: { $ne: user._id },
    }).lean();

    if (existing) {
      return NextResponse.json({ error: "Este código de afiliado já está em uso." }, { status: 409 });
    }

    user.affiliate = {
      couponCode: code,
      discountPercentage: percentage(body.discountPercentage, defaultDiscount),
      commissionPercentage: percentage(body.commissionPercentage, defaultCommission),
      totalEarned: Number(user.affiliate?.totalEarned ?? 0),
      pendingBalance: Number(user.affiliate?.pendingBalance ?? 0),
      totalPaid: Number(user.affiliate?.totalPaid ?? 0),
    };

    await user.save();

    return NextResponse.json({
      affiliate: {
        userId: String(user._id),
        name: user.name,
        email: user.email,
        ...user.affiliate.toObject?.() ?? user.affiliate,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/affiliates:", error);
    return NextResponse.json({ error: "Erro ao configurar afiliado." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const userId = String(body.userId ?? "");
    if (!userId) {
      return NextResponse.json({ error: "Afiliado não informado." }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (body.enabled === false) {
      user.affiliate = undefined;
      await user.save();
      return NextResponse.json({ success: true });
    }

    const current = user.affiliate ?? {};
    const code = normalizeCode(String(body.couponCode ?? current.couponCode ?? ""));
    if (!code) {
      return NextResponse.json({ error: "Código de afiliado não informado." }, { status: 400 });
    }

    const existing = await User.findOne({
      "affiliate.couponCode": code,
      _id: { $ne: user._id },
    }).lean();

    if (existing) {
      return NextResponse.json({ error: "Este código de afiliado já está em uso." }, { status: 409 });
    }

    user.affiliate = {
      couponCode: code,
      discountPercentage: percentage(body.discountPercentage, Number(current.discountPercentage ?? 5)),
      commissionPercentage: percentage(body.commissionPercentage, Number(current.commissionPercentage ?? 5)),
      totalEarned: Number(current.totalEarned ?? 0),
      pendingBalance: Number(current.pendingBalance ?? 0),
      totalPaid: Number(current.totalPaid ?? 0),
    };

    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/affiliates:", error);
    return NextResponse.json({ error: "Erro ao atualizar afiliado." }, { status: 500 });
  }
}
