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
    originCep: { type: String, default: "" },
    enabledMethods: {
      type: [String],
      enum: ["fixed", "correios", "loggi"],
      default: ["fixed"],
    },
    credentials: {
      correios: {
        tokenEncrypted: { type: String, default: "" },
        pacServiceCode: { type: String, default: "" },
        sedexServiceCode: { type: String, default: "" },
      },
      loggi: {
        clientIdEncrypted: { type: String, default: "" },
        clientSecretEncrypted: { type: String, default: "" },
        companyIdEncrypted: { type: String, default: "" },
      },
    },
  },
  { timestamps: true },
);

const ShippingConfig =
  mongoose.models.ShippingConfig ||
  mongoose.model("ShippingConfig", shippingConfigSchema);

export default ShippingConfig;
