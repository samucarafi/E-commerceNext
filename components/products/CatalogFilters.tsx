"use client";

import { Search, SlidersHorizontal } from "lucide-react";

type Props = {
  categories: string[];
  initial: {
    q?: string;
    type?: string;
    gender?: string;
    category?: string;
    newOnly?: boolean;
    sort?: string;
  };
};

export default function CatalogFilters({ categories, initial }: Props) {
  return (
    <form
      method="get"
      action="/produtos"
      className="rounded-2xl border border-[#e8ddd0] bg-white p-5 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal size={17} className="text-[#5b2333]" />
        <h2 className="font-serif text-lg text-[#2e2e2e]">Filtros</h2>
      </div>

      <label className="mb-4 block">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d6b50]">
          Buscar
        </span>
        <div className="flex items-center rounded-xl border border-[#e8ddd0] bg-[#faf8f6] px-3">
          <Search size={16} className="text-gray-400" />
          <input
            name="q"
            defaultValue={initial.q ?? ""}
            placeholder="Perfume ou marca"
            className="w-full bg-transparent px-2 py-3 text-sm outline-none"
          />
        </div>
      </label>

      <label className="mb-4 block">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d6b50]">
          Tipo
        </span>
        <select
          name="type"
          defaultValue={initial.type ?? ""}
          className="w-full rounded-xl border border-[#e8ddd0] bg-[#faf8f6] px-3 py-3 text-sm outline-none"
        >
          <option value="">Todos</option>
          <option value="Perfume">Perfume</option>
          <option value="Decante">Decante</option>
        </select>
      </label>

      <label className="mb-4 block">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d6b50]">
          Gênero
        </span>
        <select
          name="gender"
          defaultValue={initial.gender ?? ""}
          className="w-full rounded-xl border border-[#e8ddd0] bg-[#faf8f6] px-3 py-3 text-sm outline-none"
        >
          <option value="">Todos</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Unissex">Unissex</option>
        </select>
      </label>

      <label className="mb-4 block">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d6b50]">
          Categoria
        </span>
        <select
          name="category"
          defaultValue={initial.category ?? ""}
          className="w-full rounded-xl border border-[#e8ddd0] bg-[#faf8f6] px-3 py-3 text-sm outline-none"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-5 flex cursor-pointer items-center gap-3 text-sm text-[#3a3a3a]">
        <input
          type="checkbox"
          name="new"
          value="1"
          defaultChecked={initial.newOnly}
          className="h-4 w-4 accent-[#5b2333]"
        />
        Somente novidades
      </label>

      <label className="mb-5 block">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d6b50]">
          Ordenar por
        </span>
        <select
          name="sort"
          defaultValue={initial.sort ?? "relevance"}
          className="w-full rounded-xl border border-[#e8ddd0] bg-[#faf8f6] px-3 py-3 text-sm outline-none"
        >
          <option value="relevance">Relevância</option>
          <option value="az">A-Z</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="popularity">Mais populares</option>
        </select>
      </label>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#5b2333] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#461b28]"
      >
        Aplicar filtros
      </button>

      <a
        href="/produtos"
        className="mt-3 block text-center text-xs text-[#8d6b50] underline-offset-4 hover:underline"
      >
        Limpar filtros
      </a>
    </form>
  );
}
