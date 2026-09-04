"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock3, PackageCheck, XCircle } from "lucide-react";

type Order = {
  orderId: string;
  customer?: { name?: string; email?: string };
  items?: Array<{ title: string; quantity: number; unit_price: number }>;
  totals?: { subtotal: number; discount: number; shipping: number; total: number };
  payment?: { status?: string; mpPaymentId?: string | number };
  deliveryStatus?: string;
  createdAt?: string;
};

function money(value = 0) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/orders/${params.id}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data?.error || "Pedido não encontrado.");
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar pedido.");
      }
    }

    if (params.id) load();
  }, [params.id]);

  if (error) {
    return <main className="mx-auto max-w-4xl px-6 py-16">{error}</main>;
  }

  if (!order) {
    return <main className="mx-auto max-w-4xl px-6 py-16">Carregando pedido...</main>;
  }

  const paymentStatus = order.payment?.status;
  const approved = paymentStatus === "approved";
  const rejected = paymentStatus === "rejected" || paymentStatus === "cancelled";

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Pedido</p>
        <h1 className="mt-1 font-serif text-3xl">{order.orderId}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-5 font-serif text-xl">Pagamento</h2>
          <div className="flex items-center gap-3">
            {approved ? <CheckCircle2 /> : rejected ? <XCircle /> : <Clock3 />}
            <span>{approved ? "Aprovado" : rejected ? "Não aprovado" : "Pendente"}</span>
          </div>

          {!approved && !rejected && (
            <Link
              href={`/pedidos/${order.orderId}/pagamento`}
              className="mt-5 inline-flex rounded-xl bg-[#1c1c1c] px-4 py-3 text-sm text-white"
            >
              Continuar pagamento
            </Link>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-5 font-serif text-xl">Entrega</h2>
          <div className="flex items-center gap-3">
            <PackageCheck />
            <span>{order.deliveryStatus ?? "processing"}</span>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-5 font-serif text-xl">Itens</h2>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={`${item.title}-${index}`} className="flex justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <p>{item.title}</p>
                <p className="text-sm text-black/50">Quantidade: {item.quantity}</p>
              </div>
              <p>{money(item.unit_price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(order.totals?.subtotal)}</span></div>
          <div className="flex justify-between"><span>Desconto</span><span>- {money(order.totals?.discount)}</span></div>
          <div className="flex justify-between"><span>Frete</span><span>{money(order.totals?.shipping)}</span></div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold"><span>Total</span><span>{money(order.totals?.total)}</span></div>
        </div>
      </section>
    </main>
  );
}
