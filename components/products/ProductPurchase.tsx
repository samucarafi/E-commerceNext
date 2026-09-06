"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import AffiliateShareButton from "@/components/products/AffiliateShareButton";

export default function ProductPurchase({ product }: { product: Product }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  const unavailable = product.stock <= 0;

  function decrease() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increase() {
    setQuantity((current) => Math.min(product.stock, current + 1));
  }

  function handleAdd() {
    if (unavailable) return;

    addToCart(product, quantity);
    setIsCartOpen(true);
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-[#2e2e2e]">Quantidade</span>
        {product.stock > 0 && (
          <span className="text-gray-500">
            {product.stock} disponível{product.stock === 1 ? "" : "is"}
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex h-12 shrink-0 items-center rounded-xl border border-[#d9ccbf] bg-white">
          <button
            type="button"
            onClick={decrease}
            disabled={unavailable || quantity <= 1}
            aria-label="Diminuir quantidade"
            className="flex h-full w-11 items-center justify-center rounded-l-xl transition hover:bg-[#f8f5f2] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={16} />
          </button>

          <span className="w-10 text-center text-sm font-semibold">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increase}
            disabled={unavailable || quantity >= product.stock}
            aria-label="Aumentar quantidade"
            className="flex h-full w-11 items-center justify-center rounded-r-xl transition hover:bg-[#f8f5f2] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={unavailable}
          className="btn-gold flex min-h-12 flex-1 items-center justify-center rounded-xl px-6 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {unavailable ? "Produto esgotado" : "Adicionar à sacola"}
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        A quantidade máxima acompanha o estoque disponível.
      </p>

      <AffiliateShareButton slug={product.slug} name={product.name} />
    </div>
  );
}
