"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";

export default function NewArrivalsCarousel({ products }: { products: Product[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!products.length) return null;

  const product = products[activeIndex];
  const slug = product.slug || product.id;
  const productUrl = `/produtos/${slug}`;
  const image = product.image || "/images/default-perfume.jpg";
  const move = (direction: number) => {
    setActiveIndex((current) => (current + direction + products.length) % products.length);
  };

  return (
    <section className="mx-auto w-full min-w-0 max-w-[1400px] px-3 py-10 sm:px-5 sm:py-14 md:px-6 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-[#c6a75e]">Descobertas</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-light text-[#2e2e2e] sm:text-3xl md:text-4xl">Novidades</h2>
        </div>
        <Link href="/produtos" className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5b2333] hover:underline sm:text-xs sm:tracking-[0.12em]">
          Ver coleção
        </Link>
      </div>

      <div className="grid min-w-0 overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white shadow-sm md:min-h-[480px] md:grid-cols-[1.08fr_0.92fr]">
        <Link href={productUrl} aria-label={`Ver produto ${product.name}`} className="relative block min-h-[320px] min-w-0 overflow-hidden bg-[#f5f1ed] sm:min-h-[400px] md:min-h-[480px]">
          <Image src={image} alt={product.name} fill priority={activeIndex === 0} sizes="(max-width: 767px) 100vw, 55vw" className="object-cover p-0 transition-transform duration-500 hover:scale-[1.03]" />
        </Link>

        <div className="flex min-w-0 flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 md:px-10 lg:px-14">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#b69a5a]">{product.brand || "Royal Parfums"}</p>
          <h3 className="mt-3 break-words font-[family-name:var(--font-playfair)] text-2xl font-light leading-tight text-[#2e2e2e] sm:text-3xl md:text-4xl">{product.name}</h3>
          {product.description ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-500 sm:mt-5 sm:leading-7">{product.description}</p> : null}
          <p className="mt-5 text-lg font-medium text-[#5b2333] sm:mt-6 sm:text-xl">
            {Number(product.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <Link href={productUrl} className="mt-6 inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[#5b2333] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#421925] hover:shadow-md sm:px-7 sm:text-xs">
            Descobrir fragrância
          </Link>

          {products.length > 1 ? (
            <div className="mt-7 flex items-center justify-between border-t border-[#eee5dc] pt-4 sm:mt-9 sm:pt-5">
              <p className="text-[11px] tabular-nums text-gray-500 sm:text-xs">{String(activeIndex + 1).padStart(2, "0")} <span className="px-1 text-[#c6a75e]">/</span> {String(products.length).padStart(2, "0")}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => move(-1)} aria-label="Novidade anterior" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c9b7] bg-white text-[#5b2333] shadow-sm transition hover:border-[#c6a75e] hover:bg-[#f8f2e9] sm:h-11 sm:w-11">
                  <ChevronLeft size={19} />
                </button>
                <button type="button" onClick={() => move(1)} aria-label="Próxima novidade" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c6a75e] text-[#211a19] shadow-sm transition hover:bg-[#d4b66e] sm:h-11 sm:w-11">
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>
          ) : null}

          {products.length > 1 ? (
            <div className="mt-4 flex gap-1.5" aria-label="Selecionar novidade">
              {products.map((item, index) => (
                <button key={item.id} type="button" aria-label={`Mostrar ${item.name}`} aria-current={index === activeIndex} onClick={() => setActiveIndex(index)} className={`h-1.5 flex-1 rounded-full transition ${index === activeIndex ? "bg-[#5b2333]" : "bg-[#e8ddd0] hover:bg-[#c6a75e]"}`} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
