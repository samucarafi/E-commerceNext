import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
    },
  };
}

export const revalidate = 60;

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-10 min-h-screen">
      <nav className="text-xs text-gray-500 mb-8">
        <Link href="/">Início</Link> <span className="mx-2">›</span>
        <Link href="/produtos">Fragrâncias</Link> <span className="mx-2">›</span>
        <span>{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div className="bg-white rounded-3xl aspect-square overflow-hidden flex items-center justify-center">
          <Image
            src={product.image || "/images/default-perfume.jpg"}
            alt={product.name}
            width={900}
            height={900}
            priority
            className="w-full h-full object-contain p-8"
          />
        </div>

        <section className="py-2">
          {product.isNewProduct && (
            <span className="inline-block bg-[#C6A75E] text-[#111] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              Novo
            </span>
          )}
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-light mb-5">{product.name}</h1>
          <p className="text-2xl text-[#5B2333] mb-6">{price}</p>
          <p className="text-gray-600 leading-7 mb-8">{product.description}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            <span className="px-3 py-1 rounded-full bg-[#f0e8df] text-xs">{product.type}</span>
            <span className="px-3 py-1 rounded-full bg-[#f0e8df] text-xs">{product.gender}</span>
            <span className="px-3 py-1 rounded-full bg-[#f0e8df] text-xs">{product.category}</span>
          </div>

          <button className="btn-gold w-full md:w-auto px-10 py-4 rounded-full">
            Adicionar à sacola
          </button>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.image ? [product.image] : undefined,
            brand: { "@type": "Brand", name: product.brand },
            offers: {
              "@type": "Offer",
              priceCurrency: "BRL",
              price: product.price,
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/produtos/${product.slug}`,
            },
          }),
        }}
      />
    </main>
  );
}
