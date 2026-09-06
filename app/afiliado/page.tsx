"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";

type AffiliateData = {
  enabled: boolean;
  affiliate?: {
    couponCode: string;
    discountPercentage: number;
    commissionPercentage: number;
    totalEarned: number;
    pendingBalance: number;
    totalPaid: number;
  };
  cookieDays?: number;
  stats?: { totalOrders: number; totalSales: number };
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AffiliatePage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/affiliate")
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar.");
        return response.json();
      })
      .then(setData)
      .catch(() => setData({ enabled: false }));
  }, []);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!data) return <main className="mx-auto max-w-5xl px-4 py-16 text-sm text-gray-500">Carregando...</main>;

  if (!data.enabled || !data.affiliate) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-serif text-4xl text-[#2e2e2e]">Programa de afiliados</h1>
        <p className="mt-3 max-w-xl text-gray-500">Seu cadastro ainda não está ativo. Fale com a Royal Parfums para participar do programa.</p>
      </main>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://royalparfums.com.br";
  const storeLink = `${baseUrl}/?ref=${encodeURIComponent(data.affiliate.couponCode)}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-[#8d6b50]">Royal Parfums</p>
      <h1 className="mt-2 font-serif text-4xl text-[#2e2e2e]">Meu programa de afiliados</h1>
      <p className="mt-3 text-sm text-gray-500">Compartilhe seu link ou seu cupom. Quando uma compra aprovada for atribuída a você, sua comissão entra no saldo pendente.</p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5"><p className="text-xs text-gray-500">Comissão</p><p className="mt-2 text-2xl font-semibold">{data.affiliate.commissionPercentage}%</p></div>
        <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5"><p className="text-xs text-gray-500">Saldo pendente</p><p className="mt-2 text-2xl font-semibold">{money(data.affiliate.pendingBalance)}</p></div>
        <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5"><p className="text-xs text-gray-500">Total ganho</p><p className="mt-2 text-2xl font-semibold">{money(data.affiliate.totalEarned)}</p></div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ddd0] bg-white p-5">
        <h2 className="font-serif text-2xl text-[#5b2333]">Seu cupom</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input readOnly value={data.affiliate.couponCode} className="flex-1 rounded-xl border border-[#e8ddd0] bg-[#f8f5f2] px-4 py-3 font-semibold" />
          <button onClick={() => copy(data.affiliate!.couponCode)} className="rounded-xl bg-[#C6A75E] px-5 py-3 font-semibold text-[#111]">{copied ? <Check size={18} className="inline mr-2" /> : <Copy size={18} className="inline mr-2" />}Copiar cupom</button>
        </div>
        <p className="mt-3 text-xs text-gray-500">Quem usar este cupom recebe {data.affiliate.discountPercentage}% de desconto.</p>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ddd0] bg-white p-5">
        <h2 className="font-serif text-2xl text-[#5b2333]">Seu link de indicação</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input readOnly value={storeLink} className="min-w-0 flex-1 rounded-xl border border-[#e8ddd0] bg-[#f8f5f2] px-4 py-3 text-sm" />
          <button onClick={() => copy(storeLink)} className="rounded-xl bg-[#5b2333] px-5 py-3 font-semibold text-white">Copiar link</button>
        </div>
        <p className="mt-3 text-xs text-gray-500">O visitante que entrar por este link fica atribuído a você por {data.cookieDays ?? 30} dias.</p>
      </section>

      <Link href="/produtos" className="mt-6 inline-block text-sm text-[#8d6b50] hover:underline">Ver produtos para compartilhar</Link>
    </main>
  );
}
