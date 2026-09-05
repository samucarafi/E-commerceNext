import type { OrderStatus, DeliveryStatus } from "@/types/order";

const paymentLabels: Record<OrderStatus, string> = {
  pending: "Pagamento pendente",
  approved: "Pagamento aprovado",
  rejected: "Pagamento recusado",
};

const deliveryLabels: Record<DeliveryStatus, string> = {
  processing: "Em preparação",
  sent: "Enviado",
  delivered: "Entregue",
};

export function OrderStatusBadge({
  status,
  kind,
}: {
  status: OrderStatus | DeliveryStatus;
  kind: "payment" | "delivery";
}) {
  const label =
    kind === "payment"
      ? paymentLabels[status as OrderStatus]
      : deliveryLabels[status as DeliveryStatus];

  const approved =
    status === "approved" || status === "delivered";
  const rejected = status === "rejected";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        approved
          ? "bg-emerald-500/15 text-emerald-300"
          : rejected
            ? "bg-red-500/15 text-red-300"
            : "bg-amber-500/15 text-amber-300"
      }`}
    >
      {label}
    </span>
  );
}
