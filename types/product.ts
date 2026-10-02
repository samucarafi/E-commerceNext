import type {
  ProductType,
  LegacyProductType,
} from "@/lib/product-types";

export type { ProductType, LegacyProductType } from "@/lib/product-types";

export type Product = {
  id: string;
  /** ID do MongoDB mantido para compatibilidade com o carrinho e APIs legadas. */
  _id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: string;
  type: ProductType | LegacyProductType;
  gender: "Masculino" | "Feminino" | "Unissex";
  isNewProduct: boolean;
  brand: string;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  popularity?: number;
};
