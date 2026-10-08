import type {
  ShippingProvider,
  ShippingQuote,
} from "@/lib/shipping/types";

export const correiosShippingProvider: ShippingProvider = {
  carrier: "correios",

  async quote(): Promise<ShippingQuote[]> {
    throw new Error(
      "Integração Correios ainda não configurada. Preencha as credenciais e códigos de serviço para ativá-la.",
    );
  },
};
