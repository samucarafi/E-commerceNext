"use client";

import { useCheckout } from "@/contexts/CheckoutContext";

const inputClass =
  "w-full rounded-xl border border-[#e8ddd0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8d6b50]";

export default function AddressForm() {
  const {
    address,
    cpf,
    setAddress,
    setCpf,
    lookupCep,
    shippingLoading,
    calculateCurrentShipping,
  } = useCheckout();

  const update = (field: keyof typeof address, value: string) =>
    setAddress({ ...address, [field]: value });

  return (
    <section className="rounded-3xl border border-[#e8ddd0] bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl">Entrega</h2>
      <p className="mt-1 text-sm text-gray-500">
        Informe os dados para calcular o frete.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-sm font-medium">CPF</span>
          <input
            className={inputClass}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">CEP</span>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={address.cep}
              onChange={(e) => update("cep", e.target.value)}
              placeholder="00000-000"
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={lookupCep}
              className="rounded-xl border border-[#5b2333] px-4 text-sm font-medium text-[#5b2333]"
            >
              Buscar
            </button>
          </div>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Rua</span>
          <input
            className={inputClass}
            value={address.street}
            onChange={(e) => update("street", e.target.value)}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Número</span>
          <input
            className={inputClass}
            value={address.number}
            onChange={(e) => update("number", e.target.value)}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Complemento</span>
          <input
            className={inputClass}
            value={address.complement ?? ""}
            onChange={(e) => update("complement", e.target.value)}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Bairro</span>
          <input
            className={inputClass}
            value={address.neighborhood}
            onChange={(e) => update("neighborhood", e.target.value)}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Cidade</span>
          <input
            className={inputClass}
            value={address.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Estado</span>
          <input
            maxLength={2}
            className={inputClass}
            value={address.state}
            onChange={(e) => update("state", e.target.value.toUpperCase())}
            placeholder="RJ"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={calculateCurrentShipping}
        disabled={shippingLoading}
        className="mt-5 rounded-xl bg-[#1c1c1c] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {shippingLoading ? "Calculando frete..." : "Calcular frete"}
      </button>
    </section>
  );
}
