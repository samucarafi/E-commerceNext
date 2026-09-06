"use client";

import { FormEvent, useEffect, useState } from "react";

type Method = "fixed" | "correios" | "loggi";

type ShippingConfig = {
  originCep: string;
  enabledMethods: Method[];
  shippingByState: Record<string, number>;
  freeShippingMinValue: number;
  extraDays: number;
  credentialsConfigured: {
    correios: boolean;
    loggi: boolean;
  };
};

const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const emptyConfig: ShippingConfig = {
  originCep: "",
  enabledMethods: ["fixed"],
  shippingByState: {},
  freeShippingMinValue: 0,
  extraDays: 0,
  credentialsConfigured: { correios: false, loggi: false },
};

export default function FreteAdminPage() {
  const [config, setConfig] = useState<ShippingConfig>(emptyConfig);
  const [correios, setCorreios] = useState({
    token: "",
    pacServiceCode: "",
    sedexServiceCode: "",
  });
  const [loggi, setLoggi] = useState({
    clientId: "",
    clientSecret: "",
    companyId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/shipping-config", {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível carregar.");
        setConfig({ ...emptyConfig, ...data });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro ao carregar.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function toggleMethod(method: Method) {
    setConfig((current) => {
      const enabled = current.enabledMethods.includes(method);
      const next = enabled
        ? current.enabledMethods.filter((item) => item !== method)
        : [...current.enabledMethods, method];

      return {
        ...current,
        enabledMethods: next.length ? next : ["fixed"],
      };
    });
  }

  function updateStatePrice(state: string, value: string) {
    setConfig((current) => ({
      ...current,
      shippingByState: {
        ...current.shippingByState,
        [state]: Number(value) || 0,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/shipping-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          credentials: { correios, loggi },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar.");

      setConfig({ ...emptyConfig, ...data });
      setCorreios({ token: "", pacServiceCode: "", sedexServiceCode: "" });
      setLoggi({ clientId: "", clientSecret: "", companyId: "" });
      setMessage("Configuração de frete salva com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando configuração de frete...</p>;
  }

  return (
    <section>
      <p className="text-xs uppercase tracking-[0.2em] text-[#8d6b50]">Configuração</p>
      <h1 className="mt-2 font-serif text-4xl text-[#2e2e2e]">Frete</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        Defina as modalidades que ficarão disponíveis no checkout. A integração
        com Correios e Loggi fica preparada, mas o checkout continua usando o
        frete fixo até as credenciais estarem configuradas.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#5b2333]">Modalidades</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["fixed", "Entrega fixa"],
              ["correios", "Correios"],
              ["loggi", "Loggi"],
            ].map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8ddd0] p-4"
              >
                <input
                  type="checkbox"
                  checked={config.enabledMethods.includes(value as Method)}
                  onChange={() => toggleMethod(value as Method)}
                  className="h-4 w-4 accent-[#5b2333]"
                />
                <span className="text-sm text-[#333]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#5b2333]">Configuração geral</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-sm text-gray-600">
              CEP de origem
              <input
                value={config.originCep}
                onChange={(e) => setConfig({ ...config, originCep: e.target.value })}
                inputMode="numeric"
                maxLength={9}
                placeholder="00000-000"
                className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2 outline-none focus:border-[#C6A75E]"
              />
            </label>
            <label className="text-sm text-gray-600">
              Frete grátis acima de
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.freeShippingMinValue}
                onChange={(e) =>
                  setConfig({ ...config, freeShippingMinValue: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2 outline-none focus:border-[#C6A75E]"
              />
            </label>
            <label className="text-sm text-gray-600">
              Dias adicionais
              <input
                type="number"
                min="0"
                value={config.extraDays}
                onChange={(e) =>
                  setConfig({ ...config, extraDays: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2 outline-none focus:border-[#C6A75E]"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#5b2333]">Entrega fixa por estado</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {states.map((state) => (
              <label key={state} className="text-xs text-gray-500">
                {state}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={config.shippingByState[state] ?? 0}
                  onChange={(e) => updateStatePrice(state, e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm outline-none focus:border-[#C6A75E]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[#5b2333]">Correios</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {config.credentialsConfigured.correios
                    ? "Credenciais salvas."
                    : "Ainda não configurado."}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="password"
                value={correios.token}
                onChange={(e) => setCorreios({ ...correios, token: e.target.value })}
                placeholder="Token (deixe vazio para manter)"
                className="w-full rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm"
              />
              <input
                value={correios.pacServiceCode}
                onChange={(e) =>
                  setCorreios({ ...correios, pacServiceCode: e.target.value })
                }
                placeholder="Código do serviço PAC"
                className="w-full rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm"
              />
              <input
                value={correios.sedexServiceCode}
                onChange={(e) =>
                  setCorreios({ ...correios, sedexServiceCode: e.target.value })
                }
                placeholder="Código do serviço SEDEX"
                className="w-full rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5">
            <h2 className="font-serif text-2xl text-[#5b2333]">Loggi</h2>
            <p className="mt-1 text-xs text-gray-500">
              {config.credentialsConfigured.loggi
                ? "Credenciais salvas."
                : "Ainda não configurado."}
            </p>

            <div className="mt-4 space-y-3">
              <input
                value={loggi.clientId}
                onChange={(e) => setLoggi({ ...loggi, clientId: e.target.value })}
                placeholder="Client ID (deixe vazio para manter)"
                className="w-full rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm"
              />
              <input
                type="password"
                value={loggi.clientSecret}
                onChange={(e) => setLoggi({ ...loggi, clientSecret: e.target.value })}
                placeholder="Client Secret (deixe vazio para manter)"
                className="w-full rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm"
              />
              <input
                value={loggi.companyId}
                onChange={(e) => setLoggi({ ...loggi, companyId: e.target.value })}
                placeholder="Company ID (deixe vazio para manter)"
                className="w-full rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#5b2333] px-6 py-3 text-sm text-white transition hover:bg-[#451a27] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar configuração"}
          </button>
          {message ? <p className="text-sm text-gray-600">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}
