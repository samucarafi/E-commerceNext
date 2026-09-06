import mongoose, { Schema } from "mongoose";

export type CouponType = "percentage" | "fixed" | "shipping" | "first_purchase";

export interface CouponDocument extends mongoose.Document {
  code: string;
  type: CouponType;
  value: number;
  active: boolean;
  firstPurchaseOnly: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<CouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed", "shipping", "first_purchase"], required: true },
    value: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
    firstPurchaseOnly: { type: Boolean, default: false },
    usageLimit: { type: Number, default: null, min: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const Coupon =
  (mongoose.models.Coupon as mongoose.Model<CouponDocument>) ||
  mongoose.model<CouponDocument>("Coupon", couponSchema);

export default Coupon;
