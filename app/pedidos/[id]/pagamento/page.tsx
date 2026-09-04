import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagamento | Royal Parfums",
  description: "Pagamento do pedido Royal Parfums.",
  robots: { index: false, follow: false },
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <section className="w-full rounded-3xl border border-[#e8ddd0] bg-white p-7 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8d6b50]">
          Pedido {id}
        </p>
        <h1 className="mt-2 font-serif text-3xl">Pagamento</h1>
        <p className="mt-3 text-sm text-gray-500">
          O pedido foi criado. A tela de PIX será conectada no próximo bloco.
        </p>
      </section>
    </main>
  );
}
