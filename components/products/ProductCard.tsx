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
    <article className="group overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/produtos/${slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#f5f1ed]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-2xl text-[#8d6b50]">
              Royal
            </div>
          )}

          {product.isNewProduct && (
            <span className="absolute left-3 top-3 rounded-full bg-[#1c1c1c] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#f5e6d3]">
              Novidade
            </span>
          )}

          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#2e2e2e]">
                Indisponível
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/produtos/${slug}`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8d6b50]">
            {product.brand || product.category}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-12 font-serif text-lg text-[#2e2e2e]">
            {product.name}
          </h3>
          <p className="mt-2 text-lg font-semibold text-[#5b2333]">
            R$ {Number(product.price).toFixed(2).replace(".", ",")}
          </p>
        </Link>

        <div className="mt-4">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
