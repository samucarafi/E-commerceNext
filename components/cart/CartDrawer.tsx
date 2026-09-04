"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Fechar carrinho"
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsCartOpen(false)}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f8f5f2] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#e8ddd0] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8d6b50]">
              Royal Parfums
            </p>
            <h2 className="font-serif text-2xl text-[#1c1c1c]">Sua sacola</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded-full p-2 hover:bg-black/5"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag size={42} className="mb-4 text-[#8d6b50]" />
              <h3 className="font-serif text-2xl">Sua sacola está vazia</h3>
              <p className="mt-2 text-sm text-gray-500">
                Adicione uma fragrância para continuar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-[#e8ddd0] bg-white p-3"
                >
                  <div className="flex gap-3">
                    <div className="h-24 w-20 overflow-hidden rounded-xl bg-[#f1ece7]">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#8d6b50]">
                            {item.brand}
                          </p>
                          <h3 className="font-medium">{item.name}</h3>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-400 hover:text-red-700"
                          aria-label={`Remover ${item.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <p className="mt-2 font-semibold">
                        {money.format(item.price)}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="rounded-full border p-1"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="rounded-full border p-1"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className="border-t border-[#e8ddd0] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <strong className="text-xl">{money.format(getTotalPrice())}</strong>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-gold block w-full rounded-xl px-5 py-3 text-center font-semibold"
            >
              Ir para o checkout
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
