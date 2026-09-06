import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import AffiliateConfig from "@/models/AffiliateConfig";
import Order from "@/models/Order";

type AffiliateUserRecord = {
  _id: unknown;
  name: string;
  email: string;
  affiliate?: {
    couponCode?: string;
    discountPercentage?: number;
    commissionPercentage?: number;
    totalEarned?: number;
    pendingBalance?: number;
    totalPaid?: number;
  };
};

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    await connectMongoDB();

    const affiliate = (await User.findById(user._id)
      .select("name email affiliate")
      .lean()) as unknown as AffiliateUserRecord | null;

    const code = affiliate?.affiliate?.couponCode;
    if (!code) {
      return NextResponse.json({ enabled: false });
    }

    const config = await AffiliateConfig.findOne().sort({ createdAt: -1 }).lean();
    const orders = await Order.find({
      "affiliate.userId": user._id,
      "payment.status": "approved",
    })
      .select("orderId totals.total affiliate commission createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + Number(order.totals?.total ?? 0), 0);

    return NextResponse.json({
      enabled: true,
      affiliate: {
        couponCode: code,
        discountPercentage: Number(affiliate.affiliate?.discountPercentage ?? 0),
        commissionPercentage: Number(affiliate.affiliate?.commissionPercentage ?? 0),
        totalEarned: Number(affiliate.affiliate?.totalEarned ?? 0),
        pendingBalance: Number(affiliate.affiliate?.pendingBalance ?? 0),
        totalPaid: Number(affiliate.affiliate?.totalPaid ?? 0),
      },
      cookieDays: Number(config?.cookieDays ?? 30),
      stats: { totalOrders, totalSales },
    });
  } catch (error) {
    console.error("GET /api/affiliate:", error);
    return NextResponse.json({ error: "Erro ao carregar programa de afiliados." }, { status: 500 });
  }
}
