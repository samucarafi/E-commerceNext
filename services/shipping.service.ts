import type { ShippingConfig } from "@/types/checkout";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getShippingConfig(): Promise<ShippingConfig> {
  const response = await fetch(`${API_URL}/shipping-config`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) throw new Error("Não foi possível carregar as opções de frete.");

  return response.json();
}

export function calculateShipping(
  config: ShippingConfig,
  state: string,
  subtotal: number,
): number {
  if (
    config.freeShippingMinValue > 0 &&
    subtotal >= config.freeShippingMinValue
  ) {
    return 0;
  }

  return Number(config.shippingByState[state.toUpperCase()] ?? 0);
}
