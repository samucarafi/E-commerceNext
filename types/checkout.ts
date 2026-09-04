import type { Address } from "@/contexts/AuthContext";
import type { CartItem } from "@/contexts/CartContext";

export type ShippingConfig = {
  shippingByState: Record<string, number>;
  freeShippingMinValue: number;
  extraDays: number;
};

export type AppliedCoupon = {
  code: string;
  type: "percentage" | "fixed" | "shipping" | "affiliate";
  value: number;
  discount: number;
};

export type CheckoutState = {
  address: Address;
  cpf: string;
  shipping: number;
  coupon: AppliedCoupon | null;
};

export type CheckoutPayload = {
  items: Array<{
    productId: string;
    quantity: number;
    type: "product";
  }>;
  customer: {
    name: string;
    email: string;
    cpf: string;
  };
  shippingAddress: Address;
  shipping: number;
  coupon?: {
    code: string;
    type: AppliedCoupon["type"];
    value: number;
  };
};

export type CheckoutResponse = {
  orderId: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
};

export type CartForCheckout = CartItem[];
