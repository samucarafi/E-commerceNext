import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types/product";

export default function ProductShowcase({
  title,
  eyebrow,
  products,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
}) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-14 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-[#c6a75e]">
            {eyebrow}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-[#2e2e2e]">
            {title}
          </h2>
        </div>
        <Link
          href="/produtos"
          className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-[#5b2333] hover:underline sm:block"
        >
          Ver coleção
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-7">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Link
        href="/produtos"
        className="mt-7 block text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#5b2333] sm:hidden"
      >
        Ver coleção completa
      </Link>
    </section>
  );
}
