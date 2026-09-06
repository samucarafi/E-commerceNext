import { NextResponse } from "next/server";
import { getShippingProvider } from "@/lib/shipping";
import type { ShippingQuoteInput } from "@/lib/shipping/types";

function cleanCep(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 8);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ShippingQuoteInput>;
    const originCep = cleanCep(body.originCep || process.env.SHIPPING_ORIGIN_CEP);
    const destinationCep = cleanCep(body.destinationCep);

    if (originCep.length !== 8 || destinationCep.length !== 8) {
      return NextResponse.json({ error: "CEP de origem ou destino inválido." }, { status: 400 });
    }

    if (!Array.isArray(body.packages) || body.packages.length === 0) {
      return NextResponse.json({ error: "Nenhum pacote informado." }, { status: 400 });
    }

    const packages = body.packages.map((pkg) => ({
      weight: Number(pkg?.weight ?? 0),
      height: Number(pkg?.height ?? 0),
      width: Number(pkg?.width ?? 0),
      length: Number(pkg?.length ?? 0),
    }));

    if (packages.some((pkg) =>
      !Number.isFinite(pkg.weight) || pkg.weight < 0 ||
      !Number.isFinite(pkg.height) || pkg.height < 0 ||
      !Number.isFinite(pkg.width) || pkg.width < 0 ||
      !Number.isFinite(pkg.length) || pkg.length < 0
    )) {
      return NextResponse.json({ error: "Dados de embalagem inválidos." }, { status: 400 });
    }

    const subtotal = Number(body.subtotal ?? 0);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: "Subtotal inválido." }, { status: 400 });
    }

    const provider = getShippingProvider();
    const quotes = await provider.quote({
      originCep,
      destinationCep,
      packages,
      subtotal,
    });

    return NextResponse.json({
      provider: provider.carrier,
      quotes,
    });
  } catch (error) {
    console.error("POST /api/frete:", error);
    const message = error instanceof Error ? error.message : "Não foi possível calcular o frete.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
