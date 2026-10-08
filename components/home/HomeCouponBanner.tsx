import Link from "next/link";
import { TicketPercent, ArrowRight } from "lucide-react";
import { connectMongoDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

function couponDescription(type: string, value: number) {
  if (type === "percentage" || type === "first_purchase") return `${value}% OFF`;
  if (type === "fixed") return `${value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} OFF`;
  if (type === "shipping") return "VANTAGEM NO FRETE";
  return "OFERTA ESPECIAL";
}

export default async function HomeCouponBanner() {
  try {
    await connectMongoDB();
    const now = new Date();
    const coupon = await Coupon.findOne({
      showOnHome: true,
      active: true,
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        { $or: [{ usageLimit: null }, { $expr: { $lt: ["$usageCount", "$usageLimit"] } }] },
      ],
    }).sort({ updatedAt: -1 }).lean();

    if (!coupon) return null;

    return (
      <section className="w-full overflow-hidden border-y border-[#c6a75e]/35 bg-[#211a19] text-[#f8f2e9]">
        <div className="mx-auto grid max-w-[1400px] items-center gap-5 px-4 py-6 sm:px-6 sm:py-7 md:grid-cols-[1fr_auto] md:gap-8 md:px-10">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c6a75e]/50 bg-[#c6a75e]/10 text-[#d8bb75] sm:h-12 sm:w-12">
              <TicketPercent size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c6a75e] sm:text-[10px] sm:tracking-[0.32em]">Um presente da Royal</p>
              <h2 className="mt-1 font-[family-name:var(--font-playfair)] text-xl font-light leading-tight sm:text-2xl md:text-3xl">
                {couponDescription(coupon.type, Number(coupon.value))}
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#d7cec6] sm:text-sm">
                Use o código abaixo no seu pedido e aproveite sua próxima fragrância.
              </p>
              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-dashed border-[#c6a75e]/70 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="text-[9px] uppercase tracking-[0.16em] text-[#c6a75e] sm:text-[10px]">Cupom</span>
                <span className="break-all text-xs font-bold tracking-[0.12em] text-white sm:text-sm">{coupon.code}</span>
              </div>
            </div>
          </div>
          <Link href="/produtos" className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#c6a75e] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#211a19] transition hover:-translate-y-0.5 hover:bg-[#d8bb75] sm:min-h-11 sm:w-fit sm:px-6 sm:text-xs">
            Aproveitar oferta <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Erro ao carregar cupom destacado da home:", error);
    return null;
  }
}
