"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import { apiRequest } from "@/contexts/AuthContext";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { Order } from "@/types/order";

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ orders: Order[] }>("/orders")
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err instanceof Error ? err.message : "Não foi possível carregar os pedidos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 text-[#1c1c1c]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#5b2333]">
          <ArrowLeft size={16}/>Voltar para a loja
        </Link>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b36]">Minha conta</p><h1 className="mt-2 font-serif text-4xl">Meus pedidos</h1></div>
          <Package className="hidden h-10 w-10 text-[#9a7b36] sm:block"/>
        </div>

        {loading && <div className="rounded-2xl bg-white p-8 text-center shadow-sm">Carregando seus pedidos...</div>}
        {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-10 w-10 text-gray-400"/>
            <h2 className="mt-4 font-serif text-2xl">Você ainda não fez pedidos</h2>
            <p className="mt-2 text-sm text-gray-500">Explore a coleção e encontre sua próxima fragrância.</p>
            <Link href="/produtos" className="mt-6 inline-flex rounded-xl bg-[#5b2333] px-5 py-3 text-sm font-semibold text-white">Ver produtos</Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => {
            const paymentApproved = order.payment.status === "approved";

            return (
              <div key={order.orderId} className="rounded-2xl bg-white p-5 shadow-sm">
                <Link href={`/orders/${order.orderId}`} className="block transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Pedido</p>
                      <h2 className="mt-1 font-semibold">{order.orderId}</h2>
                      <p className="mt-1 text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <OrderStatusBadge status={order.payment.status} kind="payment"/>
                      {paymentApproved && <OrderStatusBadge status={order.deliveryStatus} kind="delivery"/>}
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-semibold">{formatCurrency(order.totals.total)}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t pt-4 text-sm text-gray-600">
                    {order.items.filter((item) => item.type === "product").length} item(ns) no pedido
                  </div>
                </Link>

                {!paymentApproved && order.payment.status !== "rejected" && order.payment.status !== "cancelled" && order.payment.status !== "expired" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/pedidos/${order.orderId}/pagamento`} className="rounded-xl bg-[#5b2333] px-4 py-2 text-sm font-semibold text-white">
                      Pagar PIX
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
