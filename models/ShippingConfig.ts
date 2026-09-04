import mongoose, { Schema } from "mongoose";

const shippingConfigSchema = new Schema(
  {
    shippingByState: {
      type: Map,
      of: Number,
      default: {},
    },
    freeShippingMinValue: { type: Number, default: 0 },
    extraDays: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ShippingConfig =
  mongoose.models.ShippingConfig ||
  mongoose.model("ShippingConfig", shippingConfigSchema);

export default ShippingConfig;
