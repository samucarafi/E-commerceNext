"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";

export default function AddToCartButton({
  product,
  disabled = false,
}: {
  product: Product;
  disabled?: boolean;
}) {
  const { addToCart, setIsCartOpen } = useCart();

  const handleAdd = () => {
    if (disabled || product.stock <= 0) return;
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled || product.stock <= 0}
      className="inline-flex min-h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#c6a75e] bg-[#c6a75e] px-2 py-2 text-[10px] font-semibold leading-tight text-[#211a19] transition hover:bg-[#d4b66e] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs"
    >
      <ShoppingBag className="shrink-0" size={14} />
      <span className="min-w-0">{product.stock > 0 ? "Adicionar" : "Esgotado"}</span>
    </button>
  );
}
