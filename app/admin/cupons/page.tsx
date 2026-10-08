import CouponHomeSelector from "@/components/admin/CouponHomeSelector";

export default function AdminCouponsPage() {
  return (
    <section>
      <p className="text-xs uppercase tracking-[0.2em] text-[#8d6b50]">Marketing</p>
      <h1 className="mt-2 font-serif text-3xl text-[#2e2e2e] sm:text-4xl">Cupom da página inicial</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
        Escolha qual cupom ativo será divulgado na home. Apenas um cupom pode ficar em destaque por vez.
      </p>
      <div className="mt-8"><CouponHomeSelector /></div>
    </section>
  );
}
