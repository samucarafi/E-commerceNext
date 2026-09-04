import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    category: {
      type: String,
      enum: [
        "Floral",
        "Amadeirado",
        "Frutado",
        "Oriental",
        "Cítrico",
        "Aromático",
        "Gourmand",
      ],
    },
    type: { type: String, enum: ["Perfume", "Decante"], default: "Perfume" },
    gender: { type: String, enum: ["Masculino", "Feminino", "Unissex"] },
    isNewProduct: { type: Boolean, default: false },
    brand: { type: String, default: "" },
    weight: { type: Number },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
