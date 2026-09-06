"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Necessário para manter a animação de saída do drawer.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (isCartOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const timer = setTimeout(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  if (!mounted) return null;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return <div className="fixed inset-0 z-[100]">
    <button aria-label="Fechar sacola" onClick={() => setIsCartOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0"}`} />
    <aside className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between border-b border-[#EEE5DC] px-6 py-5"><div><h2 className="text-base font-semibold tracking-wide text-[#1C1C1C]">Sacola</h2><p className="mt-1 text-xs text-gray-400">{totalItems ? `${totalItems} item${totalItems !== 1 ? "s" : ""}` : "Vazia"}</p></div><button aria-label="Fechar" onClick={() => setIsCartOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F0EB] text-gray-500"><X size={14} /></button></div>
      <div className="flex-1 overflow-y-auto">
        {!cartItems.length ? <div className="flex h-full flex-col items-center justify-center px-8 text-center"><div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF7F4]"><ShoppingBag size={30} strokeWidth={1.4} className="text-[#C6A75E]" /></div><p className="font-medium text-[#2E2E2E]">Sua sacola está vazia</p><p className="mt-2 mb-7 text-sm font-light text-gray-400">Adicione fragrâncias para continuar</p><Link href="/produtos" onClick={() => setIsCartOpen(false)} className="rounded-full bg-[#C6A75E] px-8 py-3 text-sm font-semibold text-[#111]">Explorar Coleção</Link></div> :
        <div className="space-y-3 px-5 py-4">{cartItems.map(item => <div key={item._id} className="flex gap-3 rounded-2xl bg-[#FAF7F4] p-3"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white"><Image src={item.image || "/images/default-perfume.jpg"} alt={item.name} fill sizes="64px" className="object-contain p-1" /></div><div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-wider text-[#B0A090]">{item.brand}</p><p className="line-clamp-1 text-sm font-medium text-[#1C1C1C]">{item.name}</p><p className="mt-1 text-sm font-semibold text-[#C6A75E]">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</p><div className="mt-2 flex items-center gap-2"><button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="h-6 w-6 rounded-full border border-[#E8DDD0] bg-white text-[#5B2333]">−</button><span className="w-4 text-center text-xs font-semibold">{item.quantity}</span><button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="h-6 w-6 rounded-full border border-[#E8DDD0] bg-white text-[#5B2333]">+</button><button aria-label="Remover item" onClick={() => removeFromCart(item._id)} className="ml-auto text-gray-300 hover:text-red-400"><Trash2 size={13} /></button></div></div></div>)}</div>}
      </div>
      {!!cartItems.length && <div className="space-y-3 border-t border-[#EEE5DC] px-5 py-5"><div className="flex justify-between"><span className="text-sm text-gray-500">Subtotal</span><span className="font-semibold text-[#1C1C1C]">R$ {getTotalPrice().toFixed(2).replace(".", ",")}</span></div><p className="text-xs text-gray-400">Frete calculado no checkout</p><Link href={user ? "/checkout" : "/login?redirect=/checkout"} onClick={() => setIsCartOpen(false)} className="block w-full rounded-full bg-[#C6A75E] py-3.5 text-center text-sm font-semibold text-[#111]">Ir para o Checkout</Link><button onClick={clearCart} className="w-full py-1 text-xs text-gray-400 hover:text-red-400">Limpar sacola</button></div>}
    </aside>
  </div>;
}
