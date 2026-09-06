import type {
  ShippingPackage,
  ShippingProvider,
  ShippingQuote,
  ShippingQuoteInput,
} from "@/lib/shipping/types";

const DEFAULT_PRICE = 19.9;
const DEFAULT_DEADLINE = 7;

function totalWeight(packages: ShippingPackage[]) {
  return packages.reduce((total, item) => total + Math.max(0, item.weight), 0);
}

export const fixedShippingProvider: ShippingProvider = {
  carrier: "fixed",

  async quote(input: ShippingQuoteInput): Promise<ShippingQuote[]> {
    const weight = totalWeight(input.packages);
    const surcharge = Math.max(0, Math.ceil(weight - 1) * 2);

    return [
      {
        id: "fixed-standard",
        carrier: "fixed",
        service: "STANDARD",
        label: "Entrega padrão",
        price: Number((DEFAULT_PRICE + surcharge).toFixed(2)),
        deadline: DEFAULT_DEADLINE,
        currency: "BRL",
      },
    ];
  },
};
