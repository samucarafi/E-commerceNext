import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Royal Parfums",
  description: "Finalize seu pedido na Royal Parfums.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-[#8d6b50]">
        Royal Parfums
      </p>
      <h1 className="mt-2 font-serif text-4xl">Checkout</h1>
      <p className="mt-3 max-w-xl text-gray-600">
        A estrutura do checkout está preparada. No próximo bloco conectaremos
        endereço, frete, cupons e pagamento ao backend existente.
      </p>
    </main>
  );
}
