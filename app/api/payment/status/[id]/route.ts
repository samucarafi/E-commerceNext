import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth-server";
import Order from "@/models/Order";
import { getMercadoPagoPayment, MercadoPagoPixPayment } from "@/lib/mercadopago";
import { syncOrderPayment } from "@/lib/payment";

export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const user=await getAuthenticatedUser();
    if(!user) return NextResponse.json({error:"Não autenticado."},{status:401});
    const {id}=await params;
    await connectMongoDB();

    const order=await Order.findOne({userId:user._id,"payment.mpPaymentId":id});
    if(!order) return NextResponse.json({error:"Pagamento não encontrado."},{status:404});

    const payment=await getMercadoPagoPayment(id);
    const updated=await syncOrderPayment(payment as MercadoPagoPixPayment);

    return NextResponse.json({
      paymentId:String(payment.id),
      status:updated?.payment?.status??order.payment.status,
      mercadoPagoStatus:payment.status,
      statusDetail:payment.status_detail,
    });
  }catch(error:unknown){
    console.error("Erro ao consultar PIX:",error);
    return NextResponse.json({error:error instanceof Error?error.message:"Erro ao consultar pagamento."},{status:500});
  }
}
