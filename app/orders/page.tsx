"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import { apiRequest } from "@/contexts/AuthContext";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { Order } from "@/types/order";

type Filters = {
  paymentStatus: string;
  deliveryStatus: string;
  from: string;
  to: string;
};
type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
const emptyFilters: Filters = {
  paymentStatus: "",
  deliveryStatus: "",
  from: "",
  to: "",
};

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (appliedFilters.paymentStatus)
      params.set("paymentStatus", appliedFilters.paymentStatus);
    if (appliedFilters.deliveryStatus)
      params.set("deliveryStatus", appliedFilters.deliveryStatus);
    if (appliedFilters.from) params.set("from", appliedFilters.from);
    if (appliedFilters.to) params.set("to", appliedFilters.to);

    try {
      const data = await apiRequest<{
        orders: Order[];
        pagination: Pagination;
      }>(`/orders?${params.toString()}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os pedidos.",
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrders]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  }

  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const lastItem = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total,
  );

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 text-[#1c1c1c]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#5b2333]"
        >
          <ArrowLeft size={16} />
          Voltar para a loja
        </Link>

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b36]">
              Minha conta
            </p>
            <h1 className="mt-2 font-serif text-4xl">Meus pedidos</h1>
            <p className="mt-2 text-sm text-gray-500">
              Consulte o pagamento e acompanhe a entrega dos seus pedidos.
            </p>
          </div>
          <Package className="hidden h-10 w-10 text-[#9a7b36] sm:block" />
        </div>

        <form
          onSubmit={applyFilters}
          className="mb-6 rounded-2xl border border-[#e8ddd0] bg-white p-4 sm:p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-gray-600">
              Pagamento
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters((v) => ({ ...v, paymentStatus: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-[#e8ddd0] bg-white px-3 py-2.5 text-sm font-normal"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="approved">Pago / aprovado</option>
                <option value="rejected">Rejeitado</option>
                <option value="cancelled">Cancelado</option>
                <option value="expired">Expirado</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Entrega
              <select
                value={filters.deliveryStatus}
                onChange={(e) =>
                  setFilters((v) => ({ ...v, deliveryStatus: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-[#e8ddd0] bg-white px-3 py-2.5 text-sm font-normal"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="processing">Em preparação</option>
                <option value="sent">Enviado</option>
                <option value="delivered">Entregue</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-600">
              De
              <input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((v) => ({ ...v, from: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Até
              <input
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((v) => ({ ...v, to: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2.5 text-sm font-normal"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-[#5b2333] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#421925]"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[#d9c9b7] px-5 py-2.5 text-sm font-semibold text-[#5b2333] hover:bg-[#f8f2e9]"
            >
              Limpar
            </button>
          </div>
        </form>

        {!loading && !error && (
          <p className="mb-4 text-sm text-gray-600">
            Exibindo{" "}
            <strong>
              {firstItem}–{lastItem}
            </strong>{" "}
            de <strong>{pagination.total}</strong> pedido(s).
          </p>
        )}

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            Carregando seus pedidos...
          </div>
        )}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-10 w-10 text-gray-400" />
            <h2 className="mt-4 font-serif text-2xl">
              Nenhum pedido encontrado
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {Object.values(appliedFilters).some(Boolean)
                ? "Tente mudar os filtros para encontrar seus pedidos."
                : "Explore a coleção e encontre sua próxima fragrância."}
            </p>
            {Object.values(appliedFilters).some(Boolean) ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-[#5b2333] px-5 py-3 text-sm font-semibold text-white"
              >
                Limpar filtros
              </button>
            ) : (
              <Link
                href="/produtos"
                className="mt-6 inline-flex rounded-xl bg-[#5b2333] px-5 py-3 text-sm font-semibold text-white"
              >
                Ver produtos
              </Link>
            )}
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const paymentApproved = order.payment.status === "approved";
              return (
                <article
                  key={order.orderId}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <Link
                    href={`/orders/${order.orderId}`}
                    className="block transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Pedido</p>
                        <h2 className="mt-1 font-semibold">{order.orderId}</h2>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <OrderStatusBadge
                          status={order.payment.status}
                          kind="payment"
                        />
                        {paymentApproved &&
                          order.deliveryStatus !== "pending" && (
                            <OrderStatusBadge
                              status={order.deliveryStatus}
                              kind="delivery"
                            />
                          )}
                        {paymentApproved &&
                          order.deliveryStatus === "pending" && (
                            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                              Entrega pendente
                            </span>
                          )}
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(order.totals.total)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 border-t pt-4 text-sm text-gray-600">
                      {
                        order.items.filter((item) => item.type === "product")
                          .length
                      }{" "}
                      item(ns) no pedido
                    </div>
                  </Link>
                  {!paymentApproved &&
                    order.payment.status !== "rejected" &&
                    order.payment.status !== "cancelled" &&
                    order.payment.status !== "expired" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/pedidos/${order.orderId}/pagamento`}
                          className="rounded-xl bg-[#5b2333] px-4 py-2 text-sm font-semibold text-white"
                        >
                          Pagar PIX
                        </Link>
                      </div>
                    )}
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && pagination.totalPages > 1 && (
          <nav
            aria-label="Paginação dos pedidos"
            className="mt-8 flex items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 rounded-full border border-[#d9c9b7] px-4 py-2 text-sm font-semibold text-[#5b2333] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-[#d9c9b7] px-4 py-2 text-sm font-semibold text-[#5b2333] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
