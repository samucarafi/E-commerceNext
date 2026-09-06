import { correiosShippingProvider } from "@/lib/shipping/correios";
import { fixedShippingProvider } from "@/lib/shipping/mock";
import { loggiShippingProvider } from "@/lib/shipping/loggi";
import type { ShippingProvider } from "@/lib/shipping/types";

const providers: Record<string, ShippingProvider> = {
  fixed: fixedShippingProvider,
  correios: correiosShippingProvider,
  loggi: loggiShippingProvider,
};

export function getShippingProvider(): ShippingProvider {
  const configured = process.env.SHIPPING_PROVIDER?.trim().toLowerCase() || "fixed";
  return providers[configured] ?? fixedShippingProvider;
}
