"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { getTotalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#242424] bg-[#1c1c1c] shadow-lg">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="relative flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Abrir filtros"
              className="relative flex flex-col gap-[5px] p-2 text-[#f5e6d3] hover:text-[#c6a75e]"
            >
              <span className="block h-[1.5px] w-6 bg-current" />
              <span className="block h-[1.5px] w-4 bg-current" />
              <span className="block h-[1.5px] w-6 bg-current" />
            </button>

            <Link
              href="/"
              aria-label="Royal Parfums"
              className="absolute left-1/2 -translate-x-1/2"
            >
              <span className="font-serif text-2xl tracking-[0.2em] text-[#f5e6d3]">
                ROYAL
              </span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/produtos"
                aria-label="Buscar produtos"
                className="rounded-full p-2 text-[#f5e6d3] hover:text-[#c6a75e]"
              >
                <Search size={19} strokeWidth={1.6} />
              </Link>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Abrir carrinho"
                className="relative rounded-full p-2 text-[#f5e6d3] hover:text-[#c6a75e]"
              >
                <ShoppingBag size={20} strokeWidth={1.6} />
                {getTotalItems() > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c6a75e] px-1 text-[9px] font-bold text-[#1c1c1c]">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {user ? (
                <details className="relative">
                  <summary
                    aria-label="Menu do usuário"
                    className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-[#333] bg-[#2a2a2a] text-[#f5e6d3] hover:border-[#c6a75e] hover:text-[#c6a75e]"
                  >
                    <User size={18} strokeWidth={1.6} />
                  </summary>
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] py-2 shadow-2xl">
                    <div className="border-b border-[#2a2a2a] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#f5e6d3]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-3 text-sm text-[#f5e6d3] hover:bg-[#2a2a2a]">
                      Meu perfil
                    </Link>
                    <Link href="/orders" className="block px-4 py-3 text-sm text-[#f5e6d3] hover:bg-[#2a2a2a]">
                      Meus pedidos
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" className="block px-4 py-3 text-sm text-[#f5e6d3] hover:bg-[#2a2a2a]">
                        Administração
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full border-t border-[#2a2a2a] px-4 py-3 text-left text-sm text-[#c6a75e] hover:bg-[#2a2a2a]"
                    >
                      Sair
                    </button>
                  </div>
                </details>
              ) : (
                <Link
                  href="/login"
                  aria-label="Entrar"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#333] bg-[#2a2a2a] text-[#f5e6d3] hover:border-[#c6a75e] hover:text-[#c6a75e]"
                >
                  <User size={18} strokeWidth={1.6} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {filtersOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            aria-label="Fechar filtros"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <aside className="relative h-full w-80 max-w-[85vw] overflow-y-auto bg-[#111] p-6 text-[#f5e6d3] shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c6a75e]">
                  Royal Parfums
                </p>
                <h2 className="mt-1 font-serif text-2xl">Filtros</h2>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Fechar filtros"
                className="rounded-full bg-[#1e1e1e] p-2 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-6 text-gray-400">
              A estrutura lateral está pronta para receber os filtros de tipo,
              gênero, categoria, novidades e ordenação conforme a listagem for
              conectada ao estado de catálogo.
            </p>

            <Link
              href="/produtos"
              onClick={() => setFiltersOpen(false)}
              className="mt-6 block rounded-xl bg-[#c6a75e] px-4 py-3 text-center text-sm font-semibold text-[#1c1c1c]"
            >
              Ver coleção
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
