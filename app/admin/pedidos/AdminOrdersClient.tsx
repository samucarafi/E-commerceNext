"use client";

import { useState } from "react";

type DeliveryStatus = "pending" | "processing" | "sent" | "delivered";
type AdminOrder = {
  orderId: string; customer: { name: string; email: string }; total: number;
  paymentStatus: string; deliveryStatus: DeliveryStatus; createdAt: string;
};
type Filters = { q: string; paymentStatus: string; deliveryStatus: string; from: string; to: string; sort: string; pageSize: number };
type Pagination = { currentPage: number; pageSize: number; totalMatching: number; totalPages: number };
type Summary = { approvedCount: number; pendingCount: number; approvedRevenue: number };

const paymentLabels: Record<string, string> = {
  pending: "Pendente", approved: "Pago / aprovado", rejected: "Rejeitado",
  cancelled: "Cancelado", expired: "Expirado",
};
const deliveryLabels: Record<DeliveryStatus, string> = {
  pending: "Pendente", processing: "Em preparação", sent: "Enviado", delivered: "Entregue",
};
const money = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
const date = (v: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));
const badge = (s: string) => s === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
  : s === "rejected" || s === "cancelled" ? "border-red-200 bg-red-50 text-red-700"
  : s === "expired" ? "border-slate-200 bg-slate-100 text-slate-700"
  : "border-amber-200 bg-amber-50 text-amber-800";
const inputClass = "mt-1 w-full rounded-xl border border-[#e8ddd0] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#5b2333]";
const labelClass = "text-xs font-semibold text-gray-600";

export default function AdminOrdersClient({ orders: initial, filters, pagination, summary }: {
  orders: AdminOrder[]; filters: Filters; pagination: Pagination; summary: Summary;
}) {
  const [orders, setOrders] = useState(initial);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  async function updateStatus(orderId: string, deliveryStatus: DeliveryStatus) {
    setSaving(orderId); setError("");
    try {
      const response = await fetch(`/api/admin/pedidos/${orderId}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deliveryStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar o pedido.");
      setOrders(current => current.map(o => o.orderId === orderId ? { ...o, deliveryStatus } : o));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar pedido.");
    } finally { setSaving(""); }
  }

  function pageUrl(page: number) {
    const p = new URLSearchParams();
    for (const key of ["q", "paymentStatus", "deliveryStatus", "from", "to"] as const) {
      if (filters[key]) p.set(key, filters[key]);
    }
    if (filters.sort !== "newest") p.set("sort", filters.sort);
    p.set("pageSize", String(filters.pageSize)); p.set("page", String(page));
    return `/admin/pedidos?${p.toString()}`;
  }

  const start = pagination.totalMatching ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0;
  const end = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalMatching);

  return <section className="space-y-6">
    <header>
      <h1 className="font-serif text-4xl">Pedidos</h1>
      <p className="mt-2 text-sm text-gray-500">Acompanhe pagamentos, entregas e histórico dos pedidos.</p>
    </header>

    <div className="grid gap-3 sm:grid-cols-3">
      <article className="rounded-2xl border border-[#e8ddd0] bg-white p-4">
        <p className="text-sm text-gray-500">Pedidos pagos</p><p className="mt-1 text-2xl font-semibold text-emerald-800">{summary.approvedCount}</p>
        <p className="mt-1 text-xs text-gray-500">Pagamentos aprovados</p>
      </article>
      <article className="rounded-2xl border border-[#e8ddd0] bg-white p-4">
        <p className="text-sm text-gray-500">Aguardando pagamento</p><p className="mt-1 text-2xl font-semibold text-amber-700">{summary.pendingCount}</p>
        <p className="mt-1 text-xs text-gray-500">Pedidos pendentes</p>
      </article>
      <article className="rounded-2xl border border-[#e8ddd0] bg-white p-4">
        <p className="text-sm text-gray-500">Receita de pedidos aprovados</p><p className="mt-1 text-2xl font-semibold text-[#5b2333]">{money(summary.approvedRevenue)}</p>
        <p className="mt-1 text-xs text-gray-500">Somente pagamentos aprovados</p>
      </article>
    </div>

    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

    <form method="GET" action="/admin/pedidos" className="rounded-2xl border border-[#e8ddd0] bg-white p-4 sm:p-5">
      <input type="hidden" name="page" value="1" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className={`${labelClass} lg:col-span-2`}>Buscar pedido ou cliente
          <input name="q" defaultValue={filters.q} placeholder="Número, nome ou e-mail" className={inputClass} />
        </label>
        <label className={labelClass}>Status do pagamento
          <select name="paymentStatus" defaultValue={filters.paymentStatus} className={inputClass}>
            <option value="">Todos</option><option value="approved">Pago / aprovado</option><option value="pending">Pendente</option>
            <option value="rejected">Rejeitado</option><option value="cancelled">Cancelado</option><option value="expired">Expirado</option>
          </select>
        </label>
        <label className={labelClass}>Status da entrega
          <select name="deliveryStatus" defaultValue={filters.deliveryStatus} className={inputClass}>
            <option value="">Todos</option><option value="pending">Pendente</option><option value="processing">Em preparação</option>
            <option value="sent">Enviado</option><option value="delivered">Entregue</option>
          </select>
        </label>
        <label className={labelClass}>De<input type="date" name="from" defaultValue={filters.from} className={inputClass} /></label>
        <label className={labelClass}>Até<input type="date" name="to" defaultValue={filters.to} className={inputClass} /></label>
        <label className={labelClass}>Ordenar por
          <select name="sort" defaultValue={filters.sort} className={inputClass}>
            <option value="newest">Mais recentes</option><option value="oldest">Mais antigos</option>
            <option value="highest">Maior valor</option><option value="lowest">Menor valor</option>
          </select>
        </label>
        <label className={labelClass}>Por página
          <select name="pageSize" defaultValue={String(filters.pageSize)} className={inputClass}>
            <option value="10">10</option><option value="25">25</option><option value="50">50</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className="min-h-10 rounded-full bg-[#5b2333] px-5 py-2 text-sm font-semibold text-white hover:bg-[#421925]">Aplicar filtros</button>
        <a href="/admin/pedidos" className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d9c9b7] px-5 py-2 text-sm font-semibold text-[#5b2333] hover:bg-[#f8f2e9]">Limpar filtros</a>
      </div>
    </form>

    <p className="text-sm text-gray-600">Exibindo <strong>{start}–{end}</strong> de <strong>{pagination.totalMatching}</strong> pedido(s) neste resultado.</p>

    {orders.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d9c9b7] bg-white p-10 text-center">
      <p className="font-semibold text-gray-700">Nenhum pedido encontrado</p><p className="mt-2 text-sm text-gray-500">Altere os filtros ou limpe a busca.</p>
    </div> : <div className="grid gap-3">
      {orders.map(order => {
        const paid = order.paymentStatus === "approved"; const busy = saving === order.orderId;
        return <article key={order.orderId} className="rounded-2xl border border-[#e8ddd0] bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0"><p className="font-semibold text-[#5b2333]">#{order.orderId}</p>
              <p className="mt-1 break-words text-sm">{order.customer.name || "Cliente sem nome"}</p>
              <p className="break-words text-xs text-gray-500">{order.customer.email}</p>
              <p className="mt-2 text-xs text-gray-400">{date(order.createdAt)}</p>
            </div>
            <div className="space-y-2 lg:min-w-48 lg:text-right"><p className="font-semibold">{money(order.total)}</p>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badge(order.paymentStatus)}`}>{paymentLabels[order.paymentStatus] ?? order.paymentStatus}</span>
              <p className="text-xs text-gray-500">Entrega: {deliveryLabels[order.deliveryStatus] ?? order.deliveryStatus}</p>
            </div>
            <div className="min-w-52"><label className="text-xs font-semibold text-gray-500">Atualizar entrega</label>
              <select value={order.deliveryStatus} disabled={!paid || busy}
                onChange={e => updateStatus(order.orderId, e.target.value as DeliveryStatus)}
                className="mt-1 w-full rounded-xl border border-[#e8ddd0] bg-white px-3 py-2 text-sm outline-none focus:border-[#5b2333] disabled:cursor-not-allowed disabled:bg-gray-100">
                <option value="pending">Pendente</option><option value="processing">Em preparação</option><option value="sent">Enviado</option><option value="delivered">Entregue</option>
              </select>
              {!paid && <p className="mt-1 text-xs text-amber-700">Disponível após aprovação do pagamento.</p>}
              {busy && <p className="mt-1 text-xs text-gray-500">Salvando...</p>}
            </div>
          </div>
        </article>;
      })}
    </div>}

    {pagination.totalPages > 1 && <nav aria-label="Paginação de pedidos" className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <a href={pageUrl(Math.max(1, pagination.currentPage - 1))} aria-disabled={pagination.currentPage === 1}
        className={`rounded-full border px-4 py-2 text-sm ${pagination.currentPage === 1 ? "pointer-events-none border-gray-200 text-gray-300" : "border-[#d9c9b7] text-[#5b2333] hover:bg-[#f8f2e9]"}`}>Anterior</a>
      <span className="px-2 text-sm text-gray-600">Página {pagination.currentPage} de {pagination.totalPages}</span>
      <a href={pageUrl(Math.min(pagination.totalPages, pagination.currentPage + 1))} aria-disabled={pagination.currentPage === pagination.totalPages}
        className={`rounded-full border px-4 py-2 text-sm ${pagination.currentPage === pagination.totalPages ? "pointer-events-none border-gray-200 text-gray-300" : "border-[#d9c9b7] text-[#5b2333] hover:bg-[#f8f2e9]"}`}>Próxima</a>
    </nav>}
  </section>;
}
