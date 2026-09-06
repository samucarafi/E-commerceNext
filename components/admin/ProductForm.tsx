"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: string;
  type?: string;
  gender?: string;
  brand?: string;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  isNewProduct?: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[#e8ddd0] bg-white px-4 py-2.5 text-sm text-[#1c1c1c] outline-none transition focus:border-[#c6a75e] focus:ring-2 focus:ring-[#c6a75e]/20";

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const editing = Boolean(productId);
  const [form, setForm] = useState({
    name: "", price: "", description: "", image: "", stock: "0",
    category: "", type: "Perfume", gender: "", brand: "", weight: "",
    height: "", width: "", length: "", isNewProduct: false,
  });
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error);
        return r.json();
      })
      .then((p: Product) => setForm({
        name: p.name ?? "", price: String(p.price ?? ""), description: p.description ?? "",
        image: p.image ?? "", stock: String(p.stock ?? 0), category: p.category ?? "",
        type: p.type ?? "Perfume", gender: p.gender ?? "", brand: p.brand ?? "",
        weight: p.weight == null ? "" : String(p.weight),
        height: p.height == null ? "" : String(p.height),
        width: p.width == null ? "" : String(p.width),
        length: p.length == null ? "" : String(p.length),
        isNewProduct: Boolean(p.isNewProduct),
      }))
      .catch((e) => setError(e.message || "Não foi possível carregar o produto."))
      .finally(() => setLoading(false));
  }, [productId]);

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      weight: form.weight === "" ? undefined : Number(form.weight),
      height: form.height === "" ? undefined : Number(form.height),
      width: form.width === "" ? undefined : Number(form.width),
      length: form.length === "" ? undefined : Number(form.length),
      popularity: 0,
    };

    const response = await fetch(editing ? `/api/products/${productId}` : "/api/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Não foi possível salvar o produto.");
      setLoading(false);
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  if (loading && editing) return <div className="p-10 text-sm text-gray-500">Carregando produto...</div>;

  return (
    <div className="rounded-2xl border border-[#eee8e0] bg-white shadow-sm">
      <div className="rounded-t-2xl bg-[#5b2333] px-7 py-5 text-[#f5e6d3]">
        <h2 className="font-semibold">{editing ? "Editar Produto" : "Novo Produto"}</h2>
        <p className="mt-1 text-xs text-[#d4a5a5]">
          {editing ? "Atualize as informações do produto." : "Cadastre um novo produto no catálogo."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 p-7">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-gray-500">Nome
            <input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="text-xs font-medium text-gray-500">Marca
            <input className={inputClass} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </label>
        </div>

        <label className="text-xs font-medium text-gray-500">Link da imagem
          <input required type="url" className={inputClass} value={form.image} onChange={(e) => set("image", e.target.value)} />
        </label>

        <label className="text-xs font-medium text-gray-500">Descrição
          <textarea required rows={4} className={`${inputClass} resize-none`} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-xs font-medium text-gray-500">Preço (R$)
            <input required min="0" step="0.01" type="number" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} />
          </label>
          <label className="text-xs font-medium text-gray-500">Estoque
            <input required min="0" type="number" className={inputClass} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </label>
          <label className="text-xs font-medium text-gray-500">Peso (kg)
            <input min="0" step="0.001" type="number" className={inputClass} value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">Dimensões para envio (cm)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-medium text-gray-500">Altura
              <input min="0" step="0.1" type="number" className={inputClass} value={form.height} onChange={(e) => set("height", e.target.value)} />
            </label>
            <label className="text-xs font-medium text-gray-500">Largura
              <input min="0" step="0.1" type="number" className={inputClass} value={form.width} onChange={(e) => set("width", e.target.value)} />
            </label>
            <label className="text-xs font-medium text-gray-500">Comprimento
              <input min="0" step="0.1" type="number" className={inputClass} value={form.length} onChange={(e) => set("length", e.target.value)} />
            </label>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Esses dados serão usados futuramente nas cotações das transportadoras.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-xs font-medium text-gray-500">Categoria
            <select required className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Selecione</option>
              {["Floral", "Frutado", "Amadeirado", "Oriental", "Cítrico", "Aromático", "Gourmand"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-500">Tipo
            <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option>Perfume</option><option>Decante</option>
            </select>
          </label>
          <label className="text-xs font-medium text-gray-500">Gênero
            <select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">Selecione</option><option>Masculino</option><option>Feminino</option><option>Unissex</option>
            </select>
          </label>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#1c1c1c]">
          <input type="checkbox" checked={form.isNewProduct} onChange={(e) => set("isNewProduct", e.target.checked)} />
          Marcar como lançamento
        </label>

        <div className="flex justify-end gap-3 border-t border-[#f0e8e0] pt-5">
          <button type="button" onClick={() => router.push("/admin/produtos")} className="rounded-full border border-[#e8ddd0] px-6 py-2.5 text-sm text-gray-600 hover:border-[#5b2333]">Cancelar</button>
          <button disabled={loading} className="rounded-full bg-[#5b2333] px-7 py-2.5 text-sm font-semibold text-[#f5e6d3] disabled:opacity-50">
            {loading ? "Salvando..." : editing ? "Atualizar Produto" : "Criar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
