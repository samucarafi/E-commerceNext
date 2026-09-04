"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Copy, ExternalLink, XCircle } from "lucide-react";
import type { PaymentStatus } from "@/types/payment";

type PixPaymentProps = {
  paymentId: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  initialStatus?: PaymentStatus;
};

function statusLabel(status: PaymentStatus) {
  switch (status) {
    case "approved":
      return "Pagamento aprovado";
    case "rejected":
    case "cancelled":
      return "Pagamento não aprovado";
    case "in_process":
      return "Pagamento em processamento";
    default:
      return "Aguardando pagamento";
  }
}

export function PixPayment({
  paymentId,
  qrCode,
  qrCodeBase64,
  ticketUrl,
  initialStatus = "pending",
}: PixPaymentProps) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "approved" || status === "rejected" || status === "cancelled") {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status/${paymentId}`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as { status?: PaymentStatus };
        if (data.status) setStatus(data.status);
      } catch {
        // Uma falha momentânea de consulta não deve interromper o polling.
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paymentId, status]);

  const copyCode = async () => {
    if (!qrCode) return;

    await navigator.clipboard.writeText(qrCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const isApproved = status === "approved";
  const isRejected = status === "rejected" || status === "cancelled";

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-6 text-center">
        {isApproved ? (
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12" />
        ) : isRejected ? (
          <XCircle className="mx-auto mb-3 h-12 w-12" />
        ) : (
          <Clock3 className="mx-auto mb-3 h-12 w-12" />
        )}

        <h1 className="font-serif text-2xl text-[#1c1c1c]">
          {statusLabel(status)}
        </h1>

        {!isApproved && !isRejected && (
          <p className="mt-2 text-sm text-black/60">
            Depois de pagar, esta tela consulta automaticamente o status.
          </p>
        )}
      </div>

      {qrCodeBase64 && !isApproved && !isRejected && (
        <div className="mb-6 flex justify-center">
          <img
            src={`data:image/png;base64,${qrCodeBase64}`}
            alt="QR Code para pagamento PIX"
            className="h-64 w-64 rounded-xl border border-black/10 p-2"
          />
        </div>
      )}

      {qrCode && !isApproved && !isRejected && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            PIX Copia e Cola
          </label>

          <div className="flex gap-2">
            <textarea
              readOnly
              value={qrCode}
              className="min-h-24 flex-1 resize-none rounded-xl border border-black/10 p-3 text-xs outline-none"
            />
            <button
              type="button"
              onClick={copyCode}
              className="h-fit rounded-xl border border-black/10 px-3 py-3 text-sm hover:bg-black/5"
              aria-label="Copiar código PIX"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {copied && (
            <p className="mt-2 text-center text-sm text-green-700">
              Código copiado.
            </p>
          )}
        </div>
      )}

      {ticketUrl && !isApproved && (
        <a
          href={ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#1c1c1c] px-4 py-3 text-sm font-medium text-white"
        >
          Abrir pagamento
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </section>
  );
}
