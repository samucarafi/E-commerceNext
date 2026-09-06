import type {
  ShippingProvider,
  ShippingQuote,
  ShippingQuoteInput,
} from "@/lib/shipping/types";

export const loggiShippingProvider: ShippingProvider = {
  carrier: "loggi",

  async quote(_input: ShippingQuoteInput): Promise<ShippingQuote[]> {
    throw new Error(
      "Integração Loggi ainda não configurada. Preencha as credenciais para ativá-la.",
    );
  },
};
