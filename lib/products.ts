import type { Product } from "@/types/product";

const API_URL = process.env.BACKEND_URL;

function normalizeProduct(raw: any): Product {
  return {
    id: String(raw._id ?? raw.id),
    slug: raw.slug ?? slugify(raw.name),
    name: raw.name,
    price: Number(raw.price ?? 0),
    description: raw.description ?? "",
    image: raw.image ?? "",
    stock: Number(raw.stock ?? 0),
    category: raw.category ?? "Aromático",
    type: raw.type ?? "Perfume",
    gender: raw.gender ?? "Unissex",
    isNewProduct: Boolean(raw.isNewProduct),
    brand: raw.brand ?? "",
    weight: raw.weight,
    popularity: Number(raw.popularity ?? 0),
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getProducts(): Promise<Product[]> {
  if (!API_URL) return [];
  const response = await fetch(`${API_URL}/products`, {
    next: { revalidate: 60, tags: ["products"] },
  });
  if (!response.ok) throw new Error("Falha ao carregar produtos");
  const data = await response.json();
  const list = Array.isArray(data) ? data : data.products ?? data.data ?? [];
  return list.map(normalizeProduct);
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug || product.id === slug) ?? null;
}
