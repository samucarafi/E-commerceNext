import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ShippingConfig from "@/models/ShippingConfig";

export async function GET() {
  try {
    await connectMongoDB();

    const config = await ShippingConfig.findOne({}).lean();

    return NextResponse.json({
      shippingByState: config?.shippingByState
        ? Object.fromEntries(config.shippingByState)
        : {},
      freeShippingMinValue: config?.freeShippingMinValue ?? 0,
      extraDays: config?.extraDays ?? 0,
    });
  } catch (error) {
    console.error("GET /api/shipping-config:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar o frete." },
      { status: 500 },
    );
  }
}
