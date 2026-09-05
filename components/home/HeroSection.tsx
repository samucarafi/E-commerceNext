"use client";

import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#1c1c1c] text-[#f5e6d3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(198,167,94,0.18),transparent_35%)]" />
      <div className="relative mx-auto grid min-h-[460px] max-w-[1400px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:px-10 lg:min-h-[540px]">
        <div className="max-w-xl">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#c6a75e]">
            Alta Perfumaria
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-light leading-[1.05] md:text-6xl">
            Essência
            <br />
            &amp; Luxo
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-gray-300">
            Fragrâncias selecionadas para transformar presença em memória.
            Descubra perfumes e decantes da Royal Parfums.
          </p>
          <Link
            href="/produtos"
            className="mt-8 inline-flex rounded-full bg-[#c6a75e] px-7 py-3 text-sm font-semibold text-[#1c1c1c] transition hover:scale-[1.02]"
          >
            Explorar coleção
          </Link>
        </div>

        <div className="relative mx-auto hidden h-80 w-full max-w-md md:block">
          <div className="absolute inset-8 rounded-full border border-[#c6a75e]/25" />
          <div className="absolute inset-16 rounded-full border border-[#c6a75e]/15" />
          <Image
            src="/images/ROYAL.png"
            alt="Royal Parfums"
            fill
            priority
            sizes="(max-width: 768px) 0px, 420px"
            className="object-contain p-10 opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
