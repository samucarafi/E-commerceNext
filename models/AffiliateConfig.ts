import mongoose, { Schema } from "mongoose";

export interface AffiliateConfigDocument extends mongoose.Document {
  affiliateDefaultDiscountPercentage: number;
  affiliateDefaultCommissionPercentage: number;
  developerCommissionPercentage: number;
  cookieDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateConfigSchema = new Schema<AffiliateConfigDocument>(
  {
    affiliateDefaultDiscountPercentage: { type: Number, default: 5, min: 0, max: 100 },
    affiliateDefaultCommissionPercentage: { type: Number, default: 5, min: 0, max: 100 },
    developerCommissionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    cookieDays: { type: Number, default: 30, min: 1, max: 365 },
  },
  { timestamps: true },
);

const AffiliateConfig =
  (mongoose.models.AffiliateConfig as mongoose.Model<AffiliateConfigDocument>) ||
  mongoose.model<AffiliateConfigDocument>("AffiliateConfig", affiliateConfigSchema);

export default AffiliateConfig;
