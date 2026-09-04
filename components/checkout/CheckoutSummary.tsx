"use client";

import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CheckoutSummary({
  onSubmit,
}: {
  onSubmit: () => void;
}) {
  const { cartItems, getTotalPrice } = useCart();
  const { shipping, getDiscount, getTotal, checkoutLoading, checkoutError } =
    useCheckout();

  return (
    <aside className="rounded-3xl border border-[#e8ddd0] bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl">Resumo</h2>

      <div className="mt-5 space-y-3">
        {cartItems.map((item) => (
          <div key={item._id} className="flex justify-between gap-4 text-sm">
            <span className="text-gray-600">
              {item.name} × {item.quantity}
            </span>
            <span>{money.format(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className="border-t border-[#e8ddd0] pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{money.format(getTotalPrice())}</span>
          </div>

          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">Frete</span>
            <span>{shipping ? money.format(shipping) : "A calcular"}</span>
          </div>

          {getDiscount() > 0 && (
            <div className="mt-2 flex justify-between text-sm text-green-700">
              <span>Desconto</span>
              <span>- {money.format(getDiscount())}</span>
            </div>
          )}

          <div className="mt-4 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{money.format(getTotal())}</span>
          </div>
        </div>
      </div>

      {checkoutError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {checkoutError}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={checkoutLoading || cartItems.length === 0}
        className="btn-gold mt-6 w-full rounded-xl px-5 py-3 font-semibold disabled:opacity-60"
      >
        {checkoutLoading ? "Processando..." : "Continuar para pagamento"}
      </button>
    </aside>
  );
}
