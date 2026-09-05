"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { getTotalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = search.trim();
    window.location.href = value
      ? `/produtos?q=${encodeURIComponent(value)}`
      : "/produtos";
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#242424] bg-[#1c1c1c] shadow-lg">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="relative flex h-16 items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              className="flex flex-col gap-[5px] p-2 text-[#f5e6d3] hover:text-[#c6a75e]"
            >
              <span className="block h-[1.5px] w-6 bg-current" />
              <span className="block h-[1.5px] w-4 bg-current" />
              <span className="block h-[1.5px] w-6 bg-current" />
            </button>

            <Link
              href="/"
              aria-label="Royal Parfums"
              className="absolute left-1/2 flex h-12 w-28 -translate-x-1/2 items-center justify-center"
            >
              <Image
                src="/images/ROYAL.png"
                alt="Royal Parfums"
                width={112}
                height={48}
                className="max-h-11 w-auto object-contain"
                priority
              />
            </Link>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <form
                onSubmit={submitSearch}
                className="hidden items-center rounded-full border border-[#333] bg-[#242424] px-3 lg:flex"
              >
                <Search size={16} className="text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar fragrância..."
                  aria-label="Buscar fragrância"
                  className="w-44 bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-gray-500"
                />
              </form>

              <Link
                href="/produtos"
                aria-label="Buscar produtos"
                className="rounded-full p-2 text-[#f5e6d3] hover:text-[#c6a75e] lg:hidden"
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

      {menuOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <aside className="relative h-full w-80 max-w-[85vw] bg-[#111] p-6 text-[#f5e6d3] shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c6a75e]">
                  Royal Parfums
                </p>
                <h2 className="mt-1 font-serif text-2xl">Menu</h2>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="rounded-full bg-[#1e1e1e] p-2 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitSearch} className="mb-5 flex items-center rounded-xl border border-[#333] bg-[#1d1d1d] px-3">
              <Search size={16} className="text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none"
              />
            </form>

            <nav className="space-y-1">
              {[
                ["/", "Início"],
                ["/produtos", "Todos os perfumes"],
                ["/produtos?type=Perfume", "Perfumes"],
                ["/produtos?type=Decante", "Decantes"],
                ["/produtos?new=1", "Novidades"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm hover:bg-[#222]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
