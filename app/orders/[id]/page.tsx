"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Package } from "lucide-react";
import { apiRequest } from "@/contexts/AuthContext";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { Order } from "@/types/order";

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const id = window.location.pathname.split("/").filter(Boolean).pop();

    async function load() {
      if (!id) {
        if (active) {
          setError("Pedido inválido.");
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiRequest<{ order: Order }>(`/orders/${id}`);
        if (active) setOrder(data.order);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar o pedido.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  if (loading) return <main className="min-h-screen bg-[#f8f5f2] p-10 text-center">Carregando pedido...</main>;

  if (error || !order) {
    return <main className="min-h-screen bg-[#f8f5f2] px-4 py-10"><div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center"><p className="text-red-600">{error || "Pedido não encontrado."}</p><Link href="/orders" className="mt-5 inline-flex text-sm font-semibold text-[#5b2333]">Voltar para pedidos</Link></div></main>;
  }

  const productItems = order.items.filter((item) => item.type === "product");

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 text-[#1c1c1c]">
      <div className="mx-auto max-w-4xl">
        <Link href="/orders" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#5b2333]"><ArrowLeft size={16} />Voltar para pedidos</Link>
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-xs text-gray-500">Pedido</p><h1 className="mt-1 font-serif text-3xl">{order.orderId}</h1><p className="mt-2 text-sm text-gray-500">{formatDate(order.createdAt)}</p></div>
            <div className="flex flex-wrap gap-2"><OrderStatusBadge status={order.payment.status} kind="payment" /><OrderStatusBadge status={order.deliveryStatus} kind="delivery" /></div>
          </div>
          <section className="py-6"><div className="mb-4 flex items-center gap-2"><Package size={19} className="text-[#9a7b36]" /><h2 className="font-semibold">Itens</h2></div>
            <div className="divide-y">{productItems.map((item, index) => <div key={item._id ?? `${item.productId}-${index}`} className="flex items-center justify-between gap-4 py-4"><div><p className="font-medium">{item.title || "Produto"}</p><p className="text-sm text-gray-500">Quantidade: {item.quantity ?? 0}</p></div><p className="font-medium">{formatCurrency((item.unit_price ?? 0) * (item.quantity ?? 0))}</p></div>)}</div>
          </section>
          <section className="border-t py-6"><h2 className="mb-4 font-semibold">Resumo</h2><div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.totals.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Desconto</span><span>- {formatCurrency(order.totals.discount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Frete</span><span>{formatCurrency(order.totals.shipping)}</span></div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{formatCurrency(order.totals.total)}</span></div>
          </div></section>
          {order.payment.status === "approved" && <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={20} />Pagamento confirmado. Seu pedido está em preparação.</div>}
        </div>
      </div>
    </main>
  );
}
