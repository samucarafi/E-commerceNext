import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { connectMongoDB } from "@/lib/mongodb";
import ShippingConfig from "@/models/ShippingConfig";
import { encryptSecret } from "@/lib/secret-crypto";

const METHODS = ["fixed", "correios", "loggi"] as const;

type ShippingMethod = (typeof METHODS)[number];

function isAdmin(user: { role?: string } | null) {
  return user?.role === "admin";
}

function cleanCep(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 8);
}

function cleanServiceCode(value: unknown) {
  return String(value ?? "").trim().slice(0, 30);
}

function cleanMethods(value: unknown): ShippingMethod[] {
  if (!Array.isArray(value)) return ["fixed"];

  const methods = value.filter((method): method is ShippingMethod =>
    METHODS.includes(method as ShippingMethod),
  );

  return methods.length ? Array.from(new Set(methods)) : ["fixed"];
}

function numberOrZero(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function safeResponse(config: any) {
  const correios = config.credentials?.correios ?? {};
  const loggi = config.credentials?.loggi ?? {};

  return {
    originCep: config.originCep ?? "",
    enabledMethods: config.enabledMethods?.length
      ? config.enabledMethods
      : ["fixed"],
    shippingByState:
      config.shippingByState instanceof Map
        ? Object.fromEntries(config.shippingByState.entries())
        : config.shippingByState ?? {},
    freeShippingMinValue: Number(config.freeShippingMinValue ?? 0),
    extraDays: Number(config.extraDays ?? 0),
    credentialsConfigured: {
      correios: Boolean(correios.tokenEncrypted),
      loggi: Boolean(
        loggi.clientIdEncrypted &&
          loggi.clientSecretEncrypted &&
          loggi.companyIdEncrypted,
      ),
    },
  };
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  await connectMongoDB();
  const config =
    (await ShippingConfig.findOne().sort({ createdAt: -1 })) ??
    new ShippingConfig();

  return NextResponse.json(safeResponse(config));
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  await connectMongoDB();

  let config = await ShippingConfig.findOne().sort({ createdAt: -1 });
  if (!config) config = new ShippingConfig();

  config.originCep = cleanCep(body.originCep);
  config.enabledMethods = cleanMethods(body.enabledMethods);
  config.freeShippingMinValue = numberOrZero(body.freeShippingMinValue);
  config.extraDays = Math.floor(numberOrZero(body.extraDays));

  const incomingShipping = body.shippingByState;
  if (incomingShipping && typeof incomingShipping === "object" && !Array.isArray(incomingShipping)) {
    const map = new Map<string, number>();
    for (const [state, value] of Object.entries(incomingShipping)) {
      const normalizedState = state.trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(normalizedState)) {
        map.set(normalizedState, numberOrZero(value));
      }
    }
    config.shippingByState = map;
  }

  const correios = body.credentials?.correios ?? {};
  const loggi = body.credentials?.loggi ?? {};

  if (String(correios.token ?? "").trim()) {
    config.credentials.correios.tokenEncrypted = encryptSecret(
      String(correios.token),
    );
  }
  if (String(correios.pacServiceCode ?? "").trim()) {
    config.credentials.correios.pacServiceCode = cleanServiceCode(
      correios.pacServiceCode,
    );
  }
  if (String(correios.sedexServiceCode ?? "").trim()) {
    config.credentials.correios.sedexServiceCode = cleanServiceCode(
      correios.sedexServiceCode,
    );
  }

  if (String(loggi.clientId ?? "").trim()) {
    config.credentials.loggi.clientIdEncrypted = encryptSecret(
      String(loggi.clientId),
    );
  }
  if (String(loggi.clientSecret ?? "").trim()) {
    config.credentials.loggi.clientSecretEncrypted = encryptSecret(
      String(loggi.clientSecret),
    );
  }
  if (String(loggi.companyId ?? "").trim()) {
    config.credentials.loggi.companyIdEncrypted = encryptSecret(
      String(loggi.companyId),
    );
  }

  await config.save();

  return NextResponse.json(safeResponse(config));
}
