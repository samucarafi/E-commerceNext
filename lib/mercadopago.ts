import { randomUUID } from "crypto";

const MP_API_URL = "https://api.mercadopago.com";

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado.");
  return token;
}

async function mpRequest<T>(path:string, init:RequestInit={}):Promise<T>{
  const response=await fetch(`${MP_API_URL}${path}`,{
    ...init,
    headers:{
      Authorization:`Bearer ${getAccessToken()}`,
      "Content-Type":"application/json",
      ...(init.headers||{}),
    },
    cache:"no-store",
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok){
    const message=data?.message||data?.error||"Erro na comunicação com o Mercado Pago.";
    throw new Error(String(message));
  }
  return data as T;
}

export type MercadoPagoPixPayment={
  id:number;
  status:string;
  status_detail?:string;
  external_reference?:string;
  point_of_interaction?:{transaction_data?:{
    qr_code?:string;
    qr_code_base64?:string;
    ticket_url?:string;
  }};
};

export function createMercadoPagoPixPayment(input:{
  orderId:string; amount:number; payer:{email:string; firstName:string};
}){
  const siteUrl=process.env.NEXT_PUBLIC_SITE_URL;
  if(!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL não configurado.");

  return mpRequest<MercadoPagoPixPayment>("/v1/payments",{
    method:"POST",
    headers:{"X-Idempotency-Key":randomUUID()},
    body:JSON.stringify({
      transaction_amount:Number(input.amount.toFixed(2)),
      description:`Pedido Royal Parfums ${input.orderId}`,
      payment_method_id:"pix",
      external_reference:input.orderId,
      payer:{email:input.payer.email,first_name:input.payer.firstName},
      notification_url:`${siteUrl.replace(/\/$/,"")}/api/payment/webhook`,
    }),
  });
}

export function getMercadoPagoPayment(paymentId:string|number){
  return mpRequest<MercadoPagoPixPayment>(`/v1/payments/${paymentId}`);
}
