import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import HeroSection from "@/components/home/HeroSection";
import ProductShowcase from "@/components/home/ProductShowcase";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://royalparfums.com.br";

export const metadata: Metadata = {
  title: "Royal Parfums | Perfumaria de Luxo",
  description:
    "Perfumes importados, decantes e fragrâncias selecionadas na Royal Parfums.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Royal Parfums | Perfumaria de Luxo",
    description:
      "Perfumes importados, decantes e fragrâncias selecionadas na Royal Parfums.",
    url: siteUrl,
  },
};

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();

  const newest = products.filter((product) => product.isNewProduct).slice(0, 8);
  const popular = [...products]
    .sort((a, b) => Number(b.popularity ?? 0) - Number(a.popularity ?? 0))
    .slice(0, 8);

  return (
    <main className="bg-[#f8f5f2]">
      <HeroSection />

      <ProductShowcase
        eyebrow="Descobertas"
        title="Novidades"
        products={newest}
      />

      <section className="border-y border-[#e8ddd0] bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-14 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c6a75e]">
            Royal Parfums
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-light text-[#2e2e2e]">
            Sua fragrância. Sua assinatura.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500">
            Encontre perfumes e decantes para diferentes estilos e ocasiões,
            com uma experiência simples do catálogo ao pedido.
          </p>
        </div>
      </section>

      <ProductShowcase
        eyebrow="Seleção Royal"
        title="Mais procurados"
        products={popular}
      />
    </main>
  );
}
