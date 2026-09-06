"use client";

import { useState } from "react";

type AdminOrder = {
  orderId: string;
  customer: { name: string; email: string };
  total: number;
  paymentStatus: string;
  deliveryStatus: "processing" | "sent" | "delivered";
  createdAt: string;
};

const deliveryLabels = {
  processing: "Em preparação",
  sent: "Enviado",
  delivered: "Entregue",
};

function formatCurrency(value: number) {
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

export default function AdminOrdersClient({
  orders: initialOrders,
}: {
  orders: AdminOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  async function updateStatus(orderId: string, deliveryStatus: AdminOrder["deliveryStatus"]) {
    setSaving(orderId);
    setError("");

    try {
      const response = await fetch(`/api/admin/pedidos/${orderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível atualizar o pedido.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.orderId === orderId ? { ...order, deliveryStatus } : order,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar pedido.");
    } finally {
      setSaving("");
    }
  }

  return (
    <section>
      <h1 className="font-serif text-4xl">Pedidos</h1>
      <p className="mt-2 text-sm text-gray-500">
        Últimos pedidos registrados.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {orders.map((order) => {
          const paid = order.paymentStatus === "approved";
          const busy = saving === order.orderId;

          return (
            <article
              key={order.orderId}
              className="rounded-2xl border border-[#e8ddd0] bg-white p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-[#5b2333]">#{order.orderId}</p>
                  <p className="mt-1 text-sm">{order.customer.name}</p>
                  <p className="text-xs text-gray-500">{order.customer.email}</p>
                  <p className="mt-2 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="font-semibold">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-gray-500">
                    Pagamento: {order.paymentStatus}
                  </p>
                  <p className="text-xs text-gray-500">
                    Entrega: {paid ? deliveryLabels[order.deliveryStatus] : "Aguardando pagamento"}
                  </p>
                </div>

                <div className="min-w-52">
                  <label className="text-xs font-semibold text-gray-500">
                    Status da entrega
                  </label>
                  <select
                    value={order.deliveryStatus}
                    disabled={!paid || busy}
                    onChange={(event) =>
                      updateStatus(
                        order.orderId,
                        event.target.value as AdminOrder["deliveryStatus"],
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-[#e8ddd0] bg-white px-3 py-2 text-sm outline-none focus:border-[#5b2333] disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="processing">Em preparação</option>
                    <option value="sent">Enviado</option>
                    <option value="delivered">Entregue</option>
                  </select>
                  {!paid && (
                    <p className="mt-1 text-xs text-amber-700">
                      Aguardando aprovação do PIX.
                    </p>
                  )}
                  {busy && (
                    <p className="mt-1 text-xs text-gray-500">Salvando...</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
