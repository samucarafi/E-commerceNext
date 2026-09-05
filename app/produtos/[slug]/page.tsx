import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
import ProductPurchase from "@/components/products/ProductPurchase";
import ProductCard from "@/components/products/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  const description =
    product.description?.trim() ||
    `${product.name} ${product.type.toLowerCase()} da ${product.brand || "Royal Parfums"}.`;

  return {
    title: `${product.name} | Royal Parfums`,
    description,
    keywords: [
      product.name,
      product.brand,
      product.category,
      product.type,
      product.gender,
      "perfume",
      "Royal Parfums",
    ].filter(Boolean),
    alternates: {
      canonical: `/produtos/${product.slug}`,
    },
    openGraph: {
      type: "website",
      title: `${product.name} | Royal Parfums`,
      description,
      url: `/produtos/${product.slug}`,
      images: product.image
        ? [{ url: product.image, alt: product.name }]
        : [{ url: "/images/default-perfume.jpg", alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Royal Parfums`,
      description,
      images: product.image ? [product.image] : ["/images/default-perfume.jpg"],
    },
  };
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const allProducts = await getProducts();

  const relatedProducts = allProducts
    .filter((item) => item.slug !== product.slug)
    .filter(
      (item) =>
        item.category === product.category ||
        item.brand === product.brand ||
        item.gender === product.gender,
    )
    .sort((a, b) => {
      const score = (item: typeof product) => {
        let value = 0;
        if (item.category === product.category) value += 3;
        if (item.brand === product.brand) value += 3;
        if (item.gender === product.gender) value += 1;
        if (item.isNewProduct) value += 1;
        return value;
      };

      return score(b) - score(a);
    })
    .slice(0, 4);

  const description =
    product.description?.trim() ||
    `${product.name} ${product.type.toLowerCase()} da ${product.brand || "Royal Parfums"}.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const productUrl = `${siteUrl}/produtos/${product.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    sku: product._id,
    image: [
      product.image
        ? product.image.startsWith("http")
          ? product.image
          : `${siteUrl}${product.image.startsWith("/") ? "" : "/"}${product.image}`
        : `${siteUrl}/images/default-perfume.jpg`,
    ],
    brand: {
      "@type": "Brand",
      name: product.brand || "Royal Parfums",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BRL",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="min-h-screen bg-[#f8f5f2]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-xs text-gray-500"
        >
          <Link href="/" className="transition hover:text-[#5b2333]">
            Início
          </Link>
          <span>›</span>
          <Link href="/produtos" className="transition hover:text-[#5b2333]">
            Fragrâncias
          </Link>
          <span>›</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:gap-14">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-[#e8ddd0] bg-white">
            {product.isNewProduct && (
              <span className="absolute left-5 top-5 z-10 rounded-full bg-[#1c1c1c] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5e6d3]">
                Novidade
              </span>
            )}

            {product.stock <= 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
                <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2e2e2e]">
                  Produto esgotado
                </span>
              </div>
            )}

            <Image
              src={product.image || "/images/default-perfume.jpg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain p-8 sm:p-12"
            />
          </div>

          <section className="flex flex-col justify-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#8d6b50]">
              {product.brand || "Royal Parfums"}
            </p>

            <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight text-[#2e2e2e] sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-3xl font-semibold text-[#5b2333]">
              {money(product.price)}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[product.type, product.gender, product.category].map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-[#eee4da] px-3 py-1.5 text-xs font-medium text-[#5b2333]"
                >
                  {label}
                </span>
              ))}
            </div>

            <p className="mt-7 whitespace-pre-line leading-7 text-gray-600">
              {description}
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 rounded-2xl border border-[#e8ddd0] bg-white p-4 text-sm">
              <div>
                <p className="text-gray-400">Disponibilidade</p>
                <p className="mt-1 font-medium">
                  {product.stock > 0 ? "Em estoque" : "Esgotado"}
                </p>
              </div>

              {product.weight != null && (
                <div>
                  <p className="text-gray-400">Volume</p>
                  <p className="mt-1 font-medium">{product.weight} ml</p>
                </div>
              )}

              <div>
                <p className="text-gray-400">Tipo</p>
                <p className="mt-1 font-medium">{product.type}</p>
              </div>

              <div>
                <p className="text-gray-400">Categoria</p>
                <p className="mt-1 font-medium">{product.category}</p>
              </div>
            </div>

            <ProductPurchase product={product} />
          </section>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-[#e8ddd0] pt-12">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d6b50]">
                Você também pode gostar
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl text-[#2e2e2e]">
                Outras fragrâncias
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
