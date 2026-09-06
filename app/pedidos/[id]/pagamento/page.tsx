"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PixPayment } from "@/components/payment/PixPayment";
import type { PaymentStatus } from "@/types/payment";

type OrderPayment = {
  orderId: string;
  payment: {
    mpPaymentId?: string | number;
    status?: PaymentStatus;
    dateOfExpiration?: string;
    pix?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
};

export default function PaymentPage() {
  const [order, setOrder] = useState<OrderPayment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const segments = window.location.pathname.split("/").filter(Boolean);
        const pedidosIndex = segments.indexOf("pedidos");
        const id =
          pedidosIndex >= 0 && segments[pedidosIndex + 1]
            ? segments[pedidosIndex + 1]
            : null;

        if (!id) throw new Error("Pedido inválido.");

        const response = await fetch(`/api/orders/${id}`, {
          cache: "no-store",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Pedido não encontrado.");
        }

        setOrder(data.order);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar pagamento.",
        );
      }
    }

    load();
  }, []);

  async function regeneratePix() {
    if (!order) return;

    const response = await fetch("/api/payment/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId: order.orderId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Não foi possível gerar um novo PIX.");
    }

    setOrder((current) =>
      current
        ? {
            ...current,
            payment: {
              ...current.payment,
              mpPaymentId: data.paymentId,
              status: data.status,
              dateOfExpiration: data.dateOfExpiration,
              pix: data.pix,
            },
          }
        : current,
    );
  }

  async function cancelOrder() {
    if (!order) return;

    const response = await fetch("/api/payment/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId: order.orderId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Não foi possível cancelar o pedido.");
    }

    setOrder((current) =>
      current
        ? {
            ...current,
            payment: {
              ...current.payment,
              status: data.status,
            },
          }
        : current,
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl">
          Não foi possível carregar o pagamento
        </h1>
        <p className="mt-2 text-black/60">{error}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="rounded-xl bg-[#1c1c1c] px-5 py-3 text-sm font-medium text-white"
          >
            Meus pedidos
          </Link>

          <Link
            href="/produtos"
            className="rounded-xl border border-black/10 px-5 py-3 text-sm"
          >
            Voltar para a loja
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-black/60">Carregando pagamento...</p>
      </main>
    );
  }

  if (!order.payment?.mpPaymentId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-serif text-2xl">
          Pagamento PIX ainda não disponível
        </h1>

        <p className="mt-2 text-sm text-black/60">
          Este pedido ainda não possui um pagamento PIX associado.
        </p>

        <button
          type="button"
          onClick={regeneratePix}
          className="mt-6 inline-flex rounded-xl bg-[#1c1c1c] px-5 py-3 text-sm font-medium text-white"
        >
          Gerar PIX
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10">
      <PixPayment
        paymentId={String(order.payment.mpPaymentId)}
        orderId={order.orderId}
        qrCode={order.payment.pix?.qr_code}
        qrCodeBase64={order.payment.pix?.qr_code_base64}
        ticketUrl={order.payment.pix?.ticket_url}
        initialStatus={order.payment.status}
        dateOfExpiration={order.payment.dateOfExpiration}
        onRegenerate={regeneratePix}
        onCancel={cancelOrder}
      />
    </main>
  );
}
