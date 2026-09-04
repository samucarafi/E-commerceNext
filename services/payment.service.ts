import { apiRequest } from "@/contexts/AuthContext";
import type { PaymentStatusResponse, PixPayment } from "@/types/payment";

export async function getPaymentStatus(
  paymentId: string | number,
): Promise<PaymentStatusResponse> {
  return apiRequest<PaymentStatusResponse>(`/payment/status/${paymentId}`);
}

/**
 * O checkout principal já cria o PIX junto com o pedido.
 * Este método fica separado para futuras telas que precisem
 * gerar um PIX fora do fluxo normal de checkout.
 */
export async function createPixPayment(payload: unknown): Promise<PixPayment> {
  return apiRequest<PixPayment>("/payment/pix", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
