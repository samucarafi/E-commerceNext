export type OrderStatus = "pending" | "approved" | "rejected";
export type DeliveryStatus = "processing" | "sent" | "delivered";

export type OrderItem = {
  _id?: string;
  productId?: string;
  title?: string;
  quantity?: number;
  unit_price?: number;
  type?: "product" | "discount" | "shipping";
};

export type Order = {
  _id: string;
  orderId: string;
  userId: string;
  customer: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  totals: {
    items?: number;
    subtotal?: number;
    discount?: number;
    originalShipping?: number;
    shippingDiscount?: number;
    shipping?: number;
    total?: number;
  };
  payment: {
    method?: string;
    status: OrderStatus;
    pix?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
    mpPaymentId?: string;
  };
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
};
