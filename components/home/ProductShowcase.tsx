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
    <section className="mx-auto w-full min-w-0 max-w-[1400px] overflow-x-clip px-3 py-10 sm:px-5 sm:py-14 md:px-6">
      <div className="mb-6 flex min-w-0 items-end justify-between gap-3 sm:mb-8">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-[#c6a75e] sm:tracking-[0.28em]">
            {eyebrow}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-light text-[#2e2e2e] sm:text-3xl">
            {title}
          </h2>
        </div>
        <Link
          href="/produtos"
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5b2333] hover:underline sm:text-xs sm:tracking-[0.12em]"
        >
          Ver coleção
        </Link>
      </div>

      {/* Grade estática: sem carrossel, overflow horizontal ou trilho de rolagem. */}
      <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-6">
        {products.slice(0, 8).map((product) => (
          <div key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
