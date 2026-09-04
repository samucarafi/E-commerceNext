"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PixPayment } from "@/components/payment/PixPayment";
import type { PaymentStatus } from "@/types/payment";

type OrderPayment = {
  orderId: string;
  payment: {
    mpPaymentId?: string | number;
    status?: PaymentStatus;
    pix?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
};

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderPayment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/orders/${params.id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Pedido não encontrado.");
        }

        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar pedido.");
      }
    }

    if (params.id) load();
  }, [params.id]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl">Não foi possível carregar o pagamento</h1>
        <p className="mt-2 text-black/60">{error}</p>
        <Link href="/produtos" className="mt-6 inline-block underline">
          Voltar para a loja
        </Link>
      </main>
    );
  }

  if (!order?.payment?.mpPaymentId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-black/60">Carregando pagamento...</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <PixPayment
        paymentId={String(order.payment.mpPaymentId)}
        qrCode={order.payment.pix?.qr_code}
        qrCodeBase64={order.payment.pix?.qr_code_base64}
        ticketUrl={order.payment.pix?.ticket_url}
        initialStatus={order.payment.status}
      />
    </main>
  );
}
