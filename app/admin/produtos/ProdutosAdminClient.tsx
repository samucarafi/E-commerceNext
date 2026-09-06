"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  _id: string; name: string; price: number; image?: string; stock: number;
  category?: string; type?: string; brand?: string; isNewProduct?: boolean;
};

function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "rose" | "gold" | "green" }) {
  const classes = {
    gray: "bg-gray-100 text-gray-600", rose: "bg-rose-50 text-rose-700",
    gold: "bg-amber-50 text-amber-700", green: "bg-emerald-50 text-emerald-700",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${classes[tone]}`}>{children}</span>;
}

export default function ProdutosAdminClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const r = await fetch("/api/products", { cache: "no-store" });
        const data = await r.json().catch(() => []);
        if (!active) return;
        if (!r.ok) setError(data.error || "Erro ao carregar produtos.");
        else setProducts(data);
      } catch {
        if (active) setError("Erro ao carregar produtos.");
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  async function remove(product: Product) {
    if (!window.confirm(`Deseja realmente excluir "${product.name}"?`)) return;
    const r = await fetch(`/api/products/${product._id}`, { method: "DELETE", credentials: "include" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { setError(data.error || "Não foi possível excluir."); return; }
    const refreshed = await fetch("/api/products", { cache: "no-store" });
    const refreshedData = await refreshed.json().catch(() => []);
    if (refreshed.ok) setProducts(refreshedData);
  }

  return <div>
    <div className="mb-8 flex items-center justify-between gap-4">
      <div><h1 className="text-xl font-semibold text-[#1c1c1c]">Produtos</h1><p className="mt-1 text-sm text-gray-400">{products.length} cadastrado{products.length === 1 ? "" : "s"}</p></div>
      <Link href="/admin/produtos/novo" className="rounded-full bg-[#c6a75e] px-5 py-2.5 text-sm font-semibold text-[#111]">+ Novo Produto</Link>
    </div>
    {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
    <div className="overflow-hidden rounded-2xl border border-[#eee8e0] bg-white shadow-sm"><div className="overflow-x-auto">
      <table className="w-full text-sm"><thead><tr className="border-b border-[#eee8e0] bg-[#faf7f4]">
        <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Produto</th><th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Preço</th><th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Estoque</th><th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Tipo</th><th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Categoria</th><th className="px-5 py-3.5 text-right text-[10px] uppercase tracking-wider text-gray-400">Ações</th>
      </tr></thead><tbody className="divide-y divide-[#f5f0eb]">
        {products.map((p) => <tr key={p._id} className="hover:bg-[#faf7f4]">
          <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-12 w-12 overflow-hidden rounded-xl bg-[#f5f0eb]">{p.image && <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1" />}</div><div><p className="max-w-[220px] truncate font-medium">{p.name}</p><p className="text-[10px] uppercase tracking-wide text-[#b0a090]">{p.brand}</p></div></div></td>
          <td className="px-5 py-4 font-medium text-[#5b2333]">R$ {p.price.toFixed(2).replace(".", ",")}</td>
          <td className="px-5 py-4"><Badge tone={p.stock === 0 ? "rose" : p.stock < 10 ? "gold" : "green"}>{p.stock === 0 ? "Esgotado" : `${p.stock} un`}</Badge></td>
          <td className="px-5 py-4"><div className="flex gap-1">{p.type && <Badge>{p.type}</Badge>}{p.isNewProduct && <Badge tone="gold">Novo</Badge>}</div></td>
          <td className="px-5 py-4 text-xs text-gray-500">{p.category || "—"}</td>
          <td className="px-5 py-4"><div className="flex justify-end gap-3"><Link href={`/admin/produtos/${p._id}/editar`} className="text-xs font-medium text-[#5b2333] hover:text-[#c6a75e]">Editar</Link><button onClick={() => remove(p)} className="text-xs font-medium text-gray-400 hover:text-red-500">Excluir</button></div></td>
        </tr>)}
      </tbody></table>
      {products.length === 0 && <div className="py-16 text-center text-sm text-gray-400">Nenhum produto cadastrado.</div>}
    </div></div>
  </div>;
}
