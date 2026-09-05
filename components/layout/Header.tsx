"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const types = ["Perfume", "Decante"];
const genders = ["Masculino", "Feminino", "Unissex"];
const categories = ["Floral", "Amadeirado", "Frutado", "Oriental", "Cítrico", "Aromático", "Gourmand"];

export default function Header() {
  const { getTotalItems, setIsCartOpen } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [q, setQ] = useState("");
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filtersOpen]);

  function goSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = q.trim();
    window.location.href = value ? `/produtos?q=${encodeURIComponent(value)}` : "/produtos";
  }

  return <>
    <header className="sticky top-0 z-50 border-b border-[#242424] bg-[#1C1C1C] shadow-lg">
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="relative flex h-16 items-center justify-between">
          <button aria-label="Abrir filtros" onClick={() => setFiltersOpen(true)} className="p-2 text-[#F5E6D3] hover:text-[#C6A75E]">
            <Menu size={24} strokeWidth={1.5}/>
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-[family-name:var(--font-playfair)] text-3xl tracking-[0.2em] text-[#F5E6D3]">ROYAL</span>
          </Link>
          <div className="flex items-center gap-2">
            <button aria-label="Abrir sacola" onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#F5E6D3] hover:text-[#C6A75E]">
              <ShoppingBag size={20} strokeWidth={1.5}/>
              {getTotalItems() > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C6A75E] px-1 text-[9px] font-bold text-[#1C1C1C]">{getTotalItems()}</span>}
            </button>
            <div ref={userRef} className="relative">
              {user ? <button aria-label="Menu do usuário" onClick={() => setUserOpen(v => !v)} className="rounded-full border border-[#333] bg-[#2A2A2A] p-2 text-[#F5E6D3] hover:border-[#C6A75E] hover:text-[#C6A75E]"><UserRound size={17} strokeWidth={1.5}/></button> :
              <Link href="/login" aria-label="Entrar" className="block rounded-full border border-[#333] bg-[#2A2A2A] p-2 text-[#F5E6D3] hover:border-[#C6A75E] hover:text-[#C6A75E]"><UserRound size={17} strokeWidth={1.5}/></Link>}
              {userOpen && <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] py-2 shadow-2xl">
                <div className="border-b border-[#2A2A2A] px-4 py-3"><p className="text-sm font-semibold text-[#F5E6D3]">{user?.name}</p><p className="truncate text-xs text-gray-500">{user?.email}</p></div>
                <Link href="/profile" onClick={() => setUserOpen(false)} className="block px-4 py-2.5 text-sm text-[#F5E6D3] hover:bg-[#2A2A2A]">Meu Perfil</Link>
                <Link href="/orders" onClick={() => setUserOpen(false)} className="block px-4 py-2.5 text-sm text-[#F5E6D3] hover:bg-[#2A2A2A]">Meus Pedidos</Link>
                {isAdmin() && <Link href="/admin" onClick={() => setUserOpen(false)} className="block px-4 py-2.5 text-sm text-[#F5E6D3] hover:bg-[#2A2A2A]">Painel Admin</Link>}
                <button onClick={() => { logout(); setUserOpen(false); }} className="w-full border-t border-[#2A2A2A] px-4 py-2.5 text-left text-sm text-[#C6A75E]">Sair</button>
              </div>}
            </div>
          </div>
        </div>
        <form onSubmit={goSearch} className="mx-auto max-w-2xl pb-3">
          <div className="flex items-center gap-3 rounded-full border border-[#292929] bg-[#111] px-4 py-2.5 focus-within:border-[#C6A75E]/50">
            <Search size={15} className="shrink-0 text-[#C6A75E]"/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar fragrância, marca, nota olfativa..." className="min-w-0 flex-1 bg-transparent text-sm text-[#F5E6D3] outline-none placeholder:text-gray-600"/>
            {q && <button type="button" onClick={() => setQ("")}><X size={14} className="text-gray-500"/></button>}
          </div>
        </form>
      </div>
    </header>

    <div className={`fixed inset-0 z-[60] ${filtersOpen ? "visible" : "invisible pointer-events-none"}`}>
      <button aria-label="Fechar filtros" onClick={() => setFiltersOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${filtersOpen ? "opacity-100" : "opacity-0"}`}/>
      <aside className={`absolute left-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-[#111] px-6 py-6 text-[#F5E6D3] transition-transform duration-300 ${filtersOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between"><div><p className="text-base font-semibold tracking-wider">Filtros</p><p className="mt-1 text-xs text-gray-500">Refine sua seleção</p></div><button aria-label="Fechar" onClick={() => setFiltersOpen(false)} className="rounded-full bg-[#1E1E1E] p-2 text-gray-500 hover:text-white"><X size={15}/></button></div>
        <FilterGroup title="Tipo" query="type" options={types}/>
        <FilterGroup title="Gênero" query="gender" options={genders}/>
        <FilterGroup title="Categoria Olfativa" query="category" options={categories}/>
        <div className="mb-7"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C6A75E]">Novidades</p><Link onClick={() => setFiltersOpen(false)} href="/produtos?new=1" className="inline-flex rounded-full border border-[#2A2A2A] px-3.5 py-1.5 text-xs text-gray-400 hover:border-[#C6A75E] hover:text-[#F5E6D3]">Apenas lançamentos</Link></div>
        <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C6A75E]">Ordenar por</p><div className="space-y-1">{[["az","Nome A–Z"],["price-asc","Menor preço"],["price-desc","Maior preço"],["popularity","Mais populares"]].map(([value,label]) => <Link key={value} onClick={() => setFiltersOpen(false)} href={`/produtos?sort=${value}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-[#1E1E1E] hover:text-[#F5E6D3]"><SlidersHorizontal size={13}/>{label}</Link>)}</div></div>
        <Link href="/produtos" onClick={() => setFiltersOpen(false)} className="mt-8 block w-full rounded-full bg-[#C6A75E] py-3 text-center text-sm font-semibold text-[#111]">Limpar filtros</Link>
      </aside>
    </div>
  </>;
}

function FilterGroup({ title, query, options }: { title: string; query: string; options: string[] }) {
  return <div className="mb-7"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C6A75E]">{title}</p><div className="flex flex-wrap gap-2">{options.map(option => <Link key={option} href={`/produtos?${query}=${encodeURIComponent(option)}`} className="rounded-full border border-[#2A2A2A] px-3.5 py-1.5 text-xs text-gray-400 hover:border-[#C6A75E] hover:text-[#F5E6D3]">{option}</Link>)}</div></div>;
}
