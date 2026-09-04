import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/products/ProductCard";

export const metadata: Metadata = {
  title: "Perfumes e Fragrâncias",
  description: "Explore o catálogo de perfumes, decantes e fragrâncias da Royal Parfums.",
};

export const revalidate = 60;

export default async function ProdutosPage() {
  const products = await getProducts();
  return (
    <main className="max-w-[1400px] mx-auto px-6 py-14 min-h-screen">
      <header className="mb-10">
        <p className="text-[#C6A75E] text-[10px] tracking-[0.28em] uppercase mb-1">Catálogo</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light">Nossas Fragrâncias</h1>
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-7">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </main>
  );
}
