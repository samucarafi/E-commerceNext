export type ShippingCarrier = "fixed" | "correios" | "loggi";

export type ShippingPackage = {
  weight: number;
  height: number;
  width: number;
  length: number;
};

export type ShippingQuote = {
  id: string;
  carrier: ShippingCarrier;
  service: string;
  label: string;
  price: number;
  deadline: number | null;
  currency: "BRL";
};

export type ShippingQuoteInput = {
  originCep: string;
  destinationCep: string;
  packages: ShippingPackage[];
  subtotal: number;
};

export type ShippingProvider = {
  carrier: ShippingCarrier;
  quote(input: ShippingQuoteInput): Promise<ShippingQuote[]>;
};
