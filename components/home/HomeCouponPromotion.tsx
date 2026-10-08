"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  code: string;
  type: string;
  value: number;
  expiresAt?: string | null;
};

export default function HomeCouponPromotion({ code, type, value, expiresAt }: Props) {
  const [copied, setCopied] = useState(false);
  const label = type === "shipping" ? "Frete grátis" : type === "fixed" ? `${value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de desconto` : `${value}% de desconto`;
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#4b1f2b] px-6 py-8 text-white shadow-[0_18px_50px_rgba(75,31,43,0.2)] md:flex md:items-center md:justify-between md:px-10">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-1 top-4 h-44 w-44 rounded-full border border-[#c6a75e]/30" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#e1c47f]">Benefício especial Royal</p>
          <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-light md:text-3xl">{label}</h2>
          <p className="mt-2 text-sm text-white/75">Use o código abaixo no checkout e aproveite sua próxima fragrância.</p>
          {expiresAt && <p className="mt-2 text-xs text-white/60">Válido até {new Date(expiresAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>}
        </div>
        <div className="relative mt-6 flex flex-wrap items-center gap-3 md:mt-0">
          <div className="rounded-xl border border-dashed border-[#d7bb78]/70 bg-white/5 px-5 py-3 font-mono text-lg tracking-[0.16em]">{code}</div>
          <button type="button" onClick={copyCode} className="rounded-xl bg-[#c6a75e] px-5 py-3 text-sm font-semibold text-[#21151a] transition hover:bg-[#d8bd7c]">{copied ? "Copiado!" : "Copiar cupom"}</button>
          <Link href="/produtos" className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">Comprar agora</Link>
        </div>
      </div>
    </section>
  );
}
