"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Copy, ExternalLink, XCircle } from "lucide-react";
import type { PaymentStatus } from "@/types/payment";

type Props = {
  paymentId: string;
  orderId: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  initialStatus?: PaymentStatus;
  dateOfExpiration?: string;
  onRegenerate: () => Promise<void>;
  onCancel: () => Promise<void>;
};

function statusLabel(status: PaymentStatus) {
  if (status === "approved") return "Pagamento aprovado";
  if (status === "cancelled") return "Pedido cancelado";
  if (status === "expired") return "PIX expirado";
  if (status === "rejected") return "Pagamento não aprovado";
  return "Aguardando pagamento";
}

export function PixPayment({ paymentId: _paymentId, orderId, qrCode, qrCodeBase64, ticketUrl, initialStatus = "pending", dateOfExpiration, onRegenerate, onCancel }: Props) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [expiration, setExpiration] = useState(dateOfExpiration);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  void paymentId;
  const [now, setNow] = useState<number | null>(null);

  // Sincroniza os dados recebidos pelo servidor com o estado visual do pagamento.
  useEffect(() => {
    // Sincronização intencional quando a página recebe um novo PIX.
    setStatus(initialStatus);
    setExpiration(dateOfExpiration);
  }, [initialStatus, dateOfExpiration]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (["approved", "rejected", "cancelled", "expired"].includes(status)) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status/${orderId}`, { cache: "no-store", credentials: "include" });
        if (!response.ok) return;
        const data = await response.json();
        if (data.status) setStatus(data.status);
        if (data.dateOfExpiration) setExpiration(data.dateOfExpiration);
      } catch {}
    }, 5000);
    return () => window.clearInterval(timer);
  }, [orderId, status]);

  const copyCode = async () => {
    if (!qrCode) return;
    await navigator.clipboard.writeText(qrCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const isApproved = status === "approved";
  const isClosed = status === "rejected" || status === "cancelled" || status === "expired";
  const expiresAt = expiration ? new Date(expiration).getTime() : 0;
  const expiredByClock = expiresAt > 0 && expiresAt <= now;

  async function regenerate() {
    setActionLoading(true);
    try { await onRegenerate(); } finally { setActionLoading(false); }
  }

  async function cancel() {
    setActionLoading(true);
    try { await onCancel(); } finally { setActionLoading(false); }
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-6 text-center">
        {isApproved ? <CheckCircle2 className="mx-auto mb-3 h-12 w-12" /> : isClosed || expiredByClock ? <XCircle className="mx-auto mb-3 h-12 w-12" /> : <Clock3 className="mx-auto mb-3 h-12 w-12" />}
        <h1 className="font-serif text-2xl">{expiredByClock && !isApproved ? "PIX expirado" : statusLabel(status)}</h1>
        {!isApproved && !isClosed && !expiredByClock && <p className="mt-2 text-sm text-black/60">Depois de pagar, esta tela consulta automaticamente o status.</p>}
      </div>

      {!isApproved && !isClosed && !expiredByClock && qrCodeBase64 && (
        <div className="mb-6 flex justify-center">
          {/* QR vindo como data URL não é um domínio externo, por isso a otimização do next/image não agrega aqui. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code para pagamento PIX" className="h-64 w-64 rounded-xl border border-black/10 p-2" />
        </div>
      )}

      {!isApproved && !isClosed && !expiredByClock && qrCode && (
        <div>
          <label className="mb-2 block text-sm font-medium">PIX Copia e Cola</label>
          <div className="flex gap-2">
            <textarea readOnly value={qrCode} className="min-h-24 flex-1 resize-none rounded-xl border border-black/10 p-3 text-xs outline-none" />
            <button type="button" onClick={copyCode} className="h-fit rounded-xl border border-black/10 px-3 py-3 text-sm hover:bg-black/5"><Copy className="h-4 w-4" /></button>
          </div>
          {copied && <p className="mt-2 text-center text-sm text-green-700">Código copiado.</p>}
        </div>
      )}

      {!isApproved && !isClosed && !expiredByClock && ticketUrl && (
        <a href={ticketUrl} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#1c1c1c] px-4 py-3 text-sm font-medium text-white">Abrir pagamento <ExternalLink className="h-4 w-4" /></a>
      )}

      {!isApproved && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {isClosed || expiredByClock ? (
            <button disabled={actionLoading} onClick={regenerate} className="flex-1 rounded-xl bg-[#5b2333] px-4 py-3 text-sm font-medium text-white disabled:opacity-50">{actionLoading ? "Gerando..." : "Gerar novo PIX"}</button>
          ) : (
            <button disabled={actionLoading} onClick={cancel} className="flex-1 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-700 disabled:opacity-50">{actionLoading ? "Cancelando..." : "Cancelar pedido"}</button>
          )}
        </div>
      )}
    </section>
  );
}
