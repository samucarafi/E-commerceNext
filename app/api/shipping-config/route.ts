import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ShippingConfig from "@/models/ShippingConfig";

type ShippingConfigData = {
  shippingByState?: Map<string, number> | Record<string, number>;
  freeShippingMinValue?: number;
  extraDays?: number;
};

export async function GET() {
  try {
    await connectMongoDB();

    const config = (await ShippingConfig.findOne({}).lean()) as ShippingConfigData | null;

    const shippingByState = config?.shippingByState;

    return NextResponse.json({
      shippingByState:
        shippingByState instanceof Map
          ? Object.fromEntries(shippingByState)
          : shippingByState && typeof shippingByState === "object"
            ? shippingByState
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
