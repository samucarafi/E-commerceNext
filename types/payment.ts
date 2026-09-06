export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired"
  | "in_process"
  | "unknown";

export type PixPayment = {
  payment_id: string | number;
  status: PaymentStatus;
  qr_code: string;
  qr_code_base64?: string;
  ticket_url?: string;
  date_of_expiration?: string;
};

export type PaymentStatusResponse = {
  status: PaymentStatus;
  dateOfExpiration?: string;
};
