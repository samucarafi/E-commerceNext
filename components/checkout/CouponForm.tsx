"use client";

import { useState } from "react";
import { Check, Tag, X } from "lucide-react";
import { useCheckout } from "@/contexts/CheckoutContext";

export default function CouponForm() {
  const [code, setCode] = useState("");
  const {
    coupon,
    couponLoading,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCheckout();

  async function handleApply() {
    if (!code.trim()) return;
    await applyCoupon(code);
  }

  if (coupon) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <Check size={17} />
            Cupom {coupon.code} aplicado
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="text-green-800"
            aria-label="Remover cupom"
          >
            <X size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-[#e8ddd0] bg-white p-5">
      <div className="flex items-center gap-2">
        <Tag size={18} className="text-[#8d6b50]" />
        <h2 className="font-serif text-xl">Cupom de desconto</h2>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Digite seu cupom"
          className="min-w-0 flex-1 rounded-xl border border-[#e8ddd0] px-4 py-3 text-sm outline-none focus:border-[#8d6b50]"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={couponLoading}
          className="rounded-xl bg-[#5b2333] px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {couponLoading ? "..." : "Aplicar"}
        </button>
      </div>

      {couponError && (
        <p className="mt-2 text-sm text-red-700">{couponError}</p>
      )}
    </section>
  );
}
