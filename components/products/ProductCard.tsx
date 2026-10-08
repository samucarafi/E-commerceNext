"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import AddToCartButton from "@/components/products/AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const slug =
    product.slug ||
    product.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const unavailable = Number(product.stock) <= 0;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#e8ddd0] bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:rounded-2xl">
      <Link href={`/produtos/${slug}`} className="block min-w-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-transparent sm:aspect-[3/4]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 23vw"
              className="object-cover p-0 transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-xl text-[#8d6b50] sm:text-2xl">
              Royal
            </div>
          )}

          {product.isNewProduct && (
            <span className="absolute left-2 top-2 rounded-full bg-[#1c1c1c] px-2 py-1 text-[8px] font-semibold uppercase tracking-wider text-[#f5e6d3] sm:left-3 sm:top-3 sm:px-3 sm:text-[10px]">
              Novidade
            </span>
          )}

          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#2e2e2e] sm:px-4 sm:py-2 sm:text-xs">
                Indisponível
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <Link href={`/produtos/${slug}`} className="min-w-0">
          <p className="truncate text-[9px] uppercase tracking-[0.12em] text-[#8d6b50] sm:text-[10px] sm:tracking-[0.18em]">
            {product.brand || product.category}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-10 break-words font-serif text-sm leading-5 text-[#2e2e2e] sm:min-h-12 sm:text-lg sm:leading-6">
            {product.name}
          </h3>
          <p className="mt-2 text-sm font-semibold text-[#5b2333] sm:text-lg">
            {Number(product.price).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </Link>

        <div className="mt-auto pt-3 sm:pt-4">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
