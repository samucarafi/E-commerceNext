import Order from "@/models/Order";
import { getMercadoPagoPayment, MercadoPagoPixPayment } from "@/lib/mercadopago";

export function mapPaymentStatus(status?:string){
  if(status==="approved") return "approved" as const;
  if(status==="rejected"||status==="cancelled") return "rejected" as const;
  return "pending" as const;
}

export async function syncOrderPayment(payment:MercadoPagoPixPayment){
  if(!payment.id) throw new Error("Pagamento do Mercado Pago sem ID.");
  const orderId=payment.external_reference;
  if(!orderId) return null;
  return Order.findOneAndUpdate(
    {orderId},
    {$set:{"payment.status":mapPaymentStatus(payment.status),"payment.mpPaymentId":String(payment.id)}},
    {new:true},
  );
}

export async function refreshOrderPayment(orderId:string){
  const order=await Order.findOne({orderId}).lean();
  if(!order) throw new Error("Pedido não encontrado.");
  if(!order.payment?.mpPaymentId) return order;
  const payment=await getMercadoPagoPayment(order.payment.mpPaymentId);
  await syncOrderPayment(payment);
  return Order.findOne({orderId}).lean();
}
