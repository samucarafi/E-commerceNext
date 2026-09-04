export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: string;
  type: "Perfume" | "Decante";
  gender: "Masculino" | "Feminino" | "Unissex";
  isNewProduct: boolean;
  brand: string;
  weight?: number;
  popularity?: number;
};
