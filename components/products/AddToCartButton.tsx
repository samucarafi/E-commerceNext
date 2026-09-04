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
      className="btn-gold inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingBag size={18} />
      {product.stock > 0 ? "Adicionar à sacola" : "Produto esgotado"}
    </button>
  );
}
