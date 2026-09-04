import { connectMongoDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import type { Product as ProductType } from "@/types/product";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeProduct(product: Record<string, unknown>): ProductType {
  return {
    id: String(product._id ?? product.id),
    name: String(product.name ?? ""),
    price: Number(product.price ?? 0),
    description: String(product.description ?? ""),
    image: String(product.image ?? ""),
    stock: Number(product.stock ?? 0),
    category: product.category as ProductType["category"],
    type: product.type as ProductType["type"],
    gender: product.gender as ProductType["gender"],
    isNewProduct: Boolean(product.isNewProduct),
    brand: String(product.brand ?? ""),
    weight: product.weight ? Number(product.weight) : undefined,
    popularity: product.popularity ? Number(product.popularity) : undefined,
    slug: String(product.slug ?? slugify(String(product.name ?? ""))),
  };
}

export async function getProducts(): Promise<ProductType[]> {
  await connectMongoDB();

  const products = await Product.find({})
    .sort({ isNewProduct: -1, popularity: -1, createdAt: -1 })
    .lean();

  return products.map((product) =>
    normalizeProduct(product as unknown as Record<string, unknown>),
  );
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
