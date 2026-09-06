import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import AffiliateConfig from "@/models/AffiliateConfig";

function validPercentage(value: unknown, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 100) return fallback;
  return number;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    await connectMongoDB();
    const config =
      (await AffiliateConfig.findOne().sort({ createdAt: -1 }).lean()) ?? {
        affiliateDefaultDiscountPercentage: 5,
        affiliateDefaultCommissionPercentage: 5,
        developerCommissionPercentage: 0,
        cookieDays: 30,
      };

    return NextResponse.json({ config });
  } catch (error) {
    console.error("GET /api/admin/affiliate-config:", error);
    return NextResponse.json({ error: "Erro ao carregar configuração." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    await connectMongoDB();

    const current =
      (await AffiliateConfig.findOne().sort({ createdAt: -1 })) ??
      new AffiliateConfig();

    current.affiliateDefaultDiscountPercentage = validPercentage(
      body.affiliateDefaultDiscountPercentage,
      current.affiliateDefaultDiscountPercentage ?? 5,
    );
    current.affiliateDefaultCommissionPercentage = validPercentage(
      body.affiliateDefaultCommissionPercentage,
      current.affiliateDefaultCommissionPercentage ?? 5,
    );
    current.developerCommissionPercentage = validPercentage(
      body.developerCommissionPercentage,
      current.developerCommissionPercentage ?? 0,
    );

    const cookieDays = Number(body.cookieDays);
    if (Number.isFinite(cookieDays) && cookieDays >= 1 && cookieDays <= 365) {
      current.cookieDays = Math.floor(cookieDays);
    }

    await current.save();

    return NextResponse.json({
      config: {
        affiliateDefaultDiscountPercentage: current.affiliateDefaultDiscountPercentage,
        affiliateDefaultCommissionPercentage: current.affiliateDefaultCommissionPercentage,
        developerCommissionPercentage: current.developerCommissionPercentage,
        cookieDays: current.cookieDays,
      },
    });
  } catch (error) {
    console.error("PUT /api/admin/affiliate-config:", error);
    return NextResponse.json({ error: "Erro ao salvar configuração." }, { status: 500 });
  }
}
