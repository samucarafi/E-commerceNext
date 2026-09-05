"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import AddressForm from "@/components/checkout/AddressForm";
import CouponForm from "@/components/checkout/CouponForm";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";

export default function CheckoutPage(){
  const router=useRouter();
  const {user,loading:authLoading}=useAuth();
  const {cartItems}=useCart();
  const {submitCheckout}=useCheckout();
  const [error,setError]=useState("");

  useEffect(()=>{if(!authLoading&&!user)router.replace("/login");},[authLoading,user,router]);

  if(authLoading||!user)return <main className="mx-auto flex min-h-[70vh] items-center justify-center px-4"><p className="text-sm text-gray-500">Carregando checkout...</p></main>;

  if(!cartItems.length)return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center"><h1 className="font-serif text-3xl">Sua sacola está vazia</h1><p className="mt-2 text-gray-500">Adicione uma fragrância antes de continuar.</p><Link href="/produtos" className="mt-6 rounded-xl bg-[#5b2333] px-5 py-3 font-medium text-white">Explorar fragrâncias</Link></main>;

  async function handleSubmit(){
    setError("");
    try{
      const result=await submitCheckout();
      const response=await fetch("/api/payment/pix",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({orderId:result.orderId}),
      });
      const payment=await response.json();
      if(!response.ok)throw new Error(payment?.error||"Não foi possível gerar o pagamento PIX.");
      router.push(`/pedidos/${result.orderId}/pagamento`);
    }catch(err){
      setError(err instanceof Error?err.message:"Não foi possível continuar.");
    }
  }

  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <div className="mb-8"><p className="text-xs uppercase tracking-[0.25em] text-[#8d6b50]">Royal Parfums</p><h1 className="mt-2 font-serif text-4xl">Finalizar compra</h1><p className="mt-2 text-sm text-gray-500">Entrega, desconto e resumo do pedido.</p></div>
    {error&&<div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"><div className="space-y-5"><AddressForm/><CouponForm/></div><CheckoutSummary onSubmit={handleSubmit}/></div>
  </main>;
}
