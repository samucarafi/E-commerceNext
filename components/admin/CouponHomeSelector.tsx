"use client";

import { useCallback, useEffect, useState } from "react";

type Coupon = {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "shipping" | "first_purchase";
  value: number;
  active: boolean;
  showOnHome?: boolean;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usageCount?: number;
};

function describeCoupon(coupon: Coupon) {
  if (coupon.type === "percentage" || coupon.type === "first_purchase") return `${coupon.value}% de desconto`;
  if (coupon.type === "fixed") return `${coupon.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de desconto`;
  return "Condição especial no frete";
}

export default function CouponHomeSelector() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/coupons", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os cupons.");
      setCoupons(data.coupons ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao carregar cupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCoupons(); }, [loadCoupons]);

  async function chooseCoupon(coupon: Coupon, showOnHome: boolean) {
    setSaving(coupon._id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon._id, showOnHome }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar o destaque.");
      setMessage(showOnHome ? `Cupom ${coupon.code} selecionado para a home.` : "Destaque removido da home.");
      await loadCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="rounded-2xl border border-[#e8ddd0] bg-white p-6 text-sm text-gray-500">Carregando cupons...</div>;

  return (
    <div className="space-y-4">
      {message ? <p role="status" className="rounded-xl bg-[#f5eee3] p-4 text-sm text-[#5b2333]">{message}</p> : null}
      {!coupons.length ? (
        <div className="rounded-2xl border border-[#e8ddd0] bg-white p-6 text-sm text-gray-500">
          Nenhum cupom cadastrado foi encontrado. Cadastre um cupom antes de selecioná-lo para a home.
        </div>
      ) : coupons.map((coupon) => {
        const expired = Boolean(coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now());
        const exhausted = Boolean(coupon.usageLimit && (coupon.usageCount ?? 0) >= coupon.usageLimit);
        const selectable = coupon.active && !expired && !exhausted;
        return (
          <article key={coupon._id} className={`flex min-w-0 flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${coupon.showOnHome ? "border-[#c6a75e] ring-1 ring-[#c6a75e]/30" : "border-[#e8ddd0]"}`}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-all font-semibold tracking-wide text-[#5b2333]">{coupon.code}</h2>
                {coupon.showOnHome ? <span className="rounded-full bg-[#f5eee3] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7b5d28]">Na home</span> : null}
                {!coupon.active ? <span className="text-xs text-red-600">Inativo</span> : null}
                {expired ? <span className="text-xs text-red-600">Expirado</span> : null}
                {exhausted ? <span className="text-xs text-red-600">Limite atingido</span> : null}
              </div>
              <p className="mt-1 text-sm text-gray-600">{describeCoupon(coupon)}</p>
            </div>
            <button type="button" disabled={saving !== null || (!selectable && !coupon.showOnHome)} onClick={() => void chooseCoupon(coupon, !coupon.showOnHome)} className={`inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5 sm:text-xs ${coupon.showOnHome ? "border border-[#e8ddd0] text-[#5b2333] hover:bg-[#f8f5f2]" : "bg-[#5b2333] text-white hover:bg-[#421925]"}`}>
              {saving === coupon._id ? "Salvando..." : coupon.showOnHome ? "Remover da home" : "Exibir na home"}
            </button>
          </article>
        );
      })}
    </div>
  );
}
