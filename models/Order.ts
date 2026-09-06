import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    orderId: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        title: String,
        quantity: Number,
        unit_price: Number,
        type: { type: String, enum: ["product", "discount", "shipping"], default: "product" },
      },
    ],
    coupon: {
      code: { type: String, default: null },
      type: { type: String, enum: ["percentage", "fixed", "shipping", "affiliate", "first_purchase", null], default: null },
      value: { type: Number, default: 0 },
      applied: { type: Boolean, default: false },
      cpfHash: { type: String, default: null },
    },
    totals: {
      items: Number,
      subtotal: Number,
      discount: { type: Number, default: 0 },
      originalShipping: { type: Number, default: 0 },
      shippingDiscount: { type: Number, default: 0 },
      shipping: Number,
      total: Number,
    },
    shipping: {
      carrier: { type: String, enum: ["fixed", "correios", "loggi"], default: "fixed" },
      service: { type: String, default: "STANDARD" },
      quoteId: { type: String, default: null },
      deadline: { type: Number, default: null },
    },
    shippingAddress: {
      cep: String,
      street: String,
      number: String,
      neighborhood: String,
      city: String,
      state: String,
      complement: String,
    },
    payment: {
      method: { type: String, default: "mercadopago" },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "cancelled", "expired"],
        default: "pending",
      },
      pix: {
        qr_code: String,
        qr_code_base64: String,
        ticket_url: String,
      },
      mpPaymentId: String,
      mpPreferenceId: String,
      dateOfExpiration: Date,
    },
    platformCommission: {
      percentage: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
      status: { type: String, enum: ["pending", "approved", "paid"], default: "pending" },
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "processing", "sent", "delivered"],
      default: "pending",
    },
    affiliate: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      couponCode: String,
      discountGiven: Number,
      commissionPercentage: Number,
      commissionValue: Number,
      status: { type: String, enum: ["pending", "approved", "paid"], default: "pending" },
    },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
