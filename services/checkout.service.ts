import { apiRequest } from "@/contexts/AuthContext";
import type {
  CheckoutPayload,
  CheckoutResponse,
} from "@/types/checkout";

export async function createCheckout(
  payload: CheckoutPayload,
): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>("/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function validateCoupon(code: string, cpf: string) {
  const data = await apiRequest<{
    coupon: {
      code: string;
      type: "percentage" | "fixed" | "shipping" | "affiliate" | "first_purchase";
      value: number;
      discount?: number;
      message?: string;
    };
  }>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, cpf }),
  });

  return data.coupon;
}
