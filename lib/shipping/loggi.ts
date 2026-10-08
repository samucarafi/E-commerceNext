import type {
  ShippingProvider,
  ShippingQuote,
} from "@/lib/shipping/types";

export const loggiShippingProvider: ShippingProvider = {
  carrier: "loggi",

  async quote(): Promise<ShippingQuote[]> {
    throw new Error(
      "Integração Loggi ainda não configurada. Preencha as credenciais para ativá-la.",
    );
  },
};
