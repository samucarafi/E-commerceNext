import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema(
  {
    cep: { type: String, default: "" },
    street: { type: String, default: "" },
    number: { type: String, default: "" },
    neighborhood: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    complement: { type: String, default: "" },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    verified: { type: Boolean, default: false },
    lastVerificationEmail: { type: Date },
    phone: { type: String, default: "" },
    cpfEncrypted: { type: String, default: "" },
    cpfHash: { type: String, default: "" },
    addresses: { type: [addressSchema], default: [] },
    usedCoupons: {
      type: [
        {
          code: String,
          usedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    affiliate: {
      couponCode: {
        type: String,
        default: undefined,
        unique: true,
        sparse: true,
      },
      discountPercentage: { type: Number, default: 5 },
      commissionPercentage: { type: Number, default: 5 },
      totalEarned: { type: Number, default: 0 },
      pendingBalance: { type: Number, default: 0 },
      totalPaid: { type: Number, default: 0 },
    },
    dateOfBirth: { type: Date },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
