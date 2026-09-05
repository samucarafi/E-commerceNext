import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getMercadoPagoPayment } from "@/lib/mercadopago";
import { syncOrderPayment } from "@/lib/payment";

export async function POST(request:NextRequest){
  try{
    const body=await request.json().catch(()=>null) as {type?:string;data?:{id?:string|number}}|null;
    const paymentId=body?.type==="payment"?body.data?.id:undefined;
    if(!paymentId) return NextResponse.json({received:true});

    await connectMongoDB();
    const payment=await getMercadoPagoPayment(paymentId);
    await syncOrderPayment(payment);
    return NextResponse.json({received:true});
  }catch(error){
    console.error("Erro no webhook do Mercado Pago:",error);
    return NextResponse.json({received:false},{status:500});
  }
}
