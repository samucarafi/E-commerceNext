import type {
  ShippingProvider,
  ShippingQuote,
  ShippingQuoteInput,
} from "@/lib/shipping/types";

export const correiosShippingProvider: ShippingProvider = {
  carrier: "correios",

  async quote(_input: ShippingQuoteInput): Promise<ShippingQuote[]> {
    throw new Error(
      "Integração Correios ainda não configurada. Preencha as credenciais e códigos de serviço para ativá-la.",
    );
  },
};
