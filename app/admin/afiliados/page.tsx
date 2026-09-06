"use client";

import { useEffect, useMemo, useState } from "react";

type Config = {
  affiliateDefaultDiscountPercentage: number;
  affiliateDefaultCommissionPercentage: number;
  developerCommissionPercentage: number;
  cookieDays: number;
};

type Affiliate = {
  _id: string;
  name: string;
  email: string;
  affiliate?: {
    couponCode?: string;
    discountPercentage?: number;
    commissionPercentage?: number;
    totalEarned?: number;
    pendingBalance?: number;
    totalPaid?: number;
  };
};

type Coupon = {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "shipping" | "first_purchase";
  value: number;
  active: boolean;
  firstPurchaseOnly: boolean;
  usageLimit?: number | null;
  usageCount: number;
  expiresAt?: string | null;
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AffiliatesAdminPage() {
  const [config, setConfig] = useState<Config>({
    affiliateDefaultDiscountPercentage: 5,
    affiliateDefaultCommissionPercentage: 5,
    developerCommissionPercentage: 0,
    cookieDays: 30,
  });
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [platformCommission, setPlatformCommission] = useState({ total: 0, paid: 0, pending: 0 });
  const [email, setEmail] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [affiliateDiscount, setAffiliateDiscount] = useState("5");
  const [affiliateCommission, setAffiliateCommission] = useState("5");
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<Coupon["type"]>("percentage");
  const [couponValue, setCouponValue] = useState("10");
  const [couponLimit, setCouponLimit] = useState("");
  const [couponExpiry, setCouponExpiry] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [configRes, affiliatesRes, couponsRes] = await Promise.all([
        fetch("/api/admin/affiliate-config"),
        fetch("/api/admin/affiliates"),
        fetch("/api/admin/coupons"),
      ]);
      if (!configRes.ok || !affiliatesRes.ok || !couponsRes.ok) throw new Error("Não foi possível carregar as configurações.");
      const configData = await configRes.json();
      const affiliatesData = await affiliatesRes.json();
      const couponsData = await couponsRes.json();
      setConfig(configData.config);
      setAffiliateDiscount(String(configData.config.affiliateDefaultDiscountPercentage));
      setAffiliateCommission(String(configData.config.affiliateDefaultCommissionPercentage));
      setAffiliates(affiliatesData.affiliates);
      setCoupons(couponsData.coupons);
      setPlatformCommission(affiliatesData.platformCommission ?? { total: 0, paid: 0, pending: 0 });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function saveConfig() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/affiliate-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar.");
      setConfig(data.config);
      setMessage("Configurações salvas.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAffiliate() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          couponCode: affiliateCode,
          discountPercentage: Number(affiliateDiscount),
          commissionPercentage: Number(affiliateCommission),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao configurar afiliado.");
      setEmail("");
      setAffiliateCode("");
      await load();
      setMessage("Afiliado configurado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao configurar afiliado.");
    } finally {
      setSaving(false);
    }
  }

  async function saveCoupon() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          type: couponType,
          value: Number(couponValue),
          usageLimit: couponLimit ? Number(couponLimit) : null,
          expiresAt: couponExpiry || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao criar cupom.");
      setCouponCode("");
      setCouponLimit("");
      setCouponExpiry("");
      await load();
      setMessage("Cupom criado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao criar cupom.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleCoupon(coupon: Coupon) {
    const response = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon._id, active: !coupon.active }),
    });
    if (response.ok) await load();
  }

  async function removeAffiliate(userId: string) {
    if (!window.confirm("Desativar este afiliado?")) return;
    const response = await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, enabled: false }),
    });
    if (response.ok) await load();
  }

  async function removeCoupon(id: string) {
    if (!window.confirm("Excluir este cupom?")) return;
    const response = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (response.ok) await load();
  }

  const affiliatePending = useMemo(
    () => affiliates.reduce((sum, item) => sum + Number(item.affiliate?.pendingBalance ?? 0), 0),
    [affiliates],
  );

  if (loading) return <p className="text-sm text-gray-500">Carregando...</p>;

  return (
    <section>
      <p className="text-xs uppercase tracking-[0.2em] text-[#8d6b50]">Marketing</p>
      <h1 className="mt-2 font-serif text-4xl text-[#2e2e2e]">Afiliados e cupons</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
        Configure descontos, comissões dos afiliados, comissão da Royal e cupons promocionais.
      </p>

      {message && (
        <div className="mt-5 rounded-xl border border-[#e8ddd0] bg-white px-4 py-3 text-sm">{message}</div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e8ddd0] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#5b2333]">Configuração geral</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Desconto padrão do afiliado (%)
              <input value={config.affiliateDefaultDiscountPercentage} onChange={(e) => setConfig({ ...config, affiliateDefaultDiscountPercentage: Number(e.target.value) })} type="number" min="0" max="100" step="0.01" className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2" />
            </label>
            <label className="text-sm">Comissão padrão do afiliado (%)
              <input value={config.affiliateDefaultCommissionPercentage} onChange={(e) => setConfig({ ...config, affiliateDefaultCommissionPercentage: Number(e.target.value) })} type="number" min="0" max="100" step="0.01" className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2" />
            </label>
            <label className="text-sm">Sua comissão por pedido (%)
              <input value={config.developerCommissionPercentage} onChange={(e) => setConfig({ ...config, developerCommissionPercentage: Number(e.target.value) })} type="number" min="0" max="100" step="0.01" className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2" />
            </label>
            <label className="text-sm">Validade do link do afiliado (dias)
              <input value={config.cookieDays} onChange={(e) => setConfig({ ...config, cookieDays: Number(e.target.value) })} type="number" min="1" max="365" className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-3 py-2" />
            </label>
          </div>
          <button onClick={saveConfig} disabled={saving} className="mt-5 rounded-xl bg-[#5b2333] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
            Salvar configuração
          </button>
        </section>

        <section className="rounded-2xl border border-[#e8ddd0] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#5b2333]">Resumo de comissões</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f8f5f2] p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Afiliados cadastrados</p>
              <p className="mt-1 text-2xl font-semibold">{affiliates.length}</p>
            </div>
            <div className="rounded-xl bg-[#f8f5f2] p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Saldo pendente dos afiliados</p>
              <p className="mt-1 text-2xl font-semibold">{money(affiliatePending)}</p>
            </div>
            <div className="rounded-xl bg-[#f8f5f2] p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-wider text-gray-500">Sua comissão acumulada</p>
              <p className="mt-1 text-2xl font-semibold">{money(platformCommission.total)}</p>
              <p className="mt-1 text-xs text-gray-500">Disponível para retirada: {money(platformCommission.pending)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            A comissão da Royal é registrada no pedido quando o pagamento é aprovado. Ela não é transferida automaticamente para uma conta.
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#e8ddd0] bg-white p-5">
        <h2 className="font-serif text-2xl text-[#5b2333]">Adicionar afiliado</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail do usuário" className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm" />
          <input value={affiliateCode} onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())} placeholder="Código (opcional)" className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm" />
          <input value={affiliateDiscount} onChange={(e) => setAffiliateDiscount(e.target.value)} type="number" min="0" max="100" step="0.01" placeholder="Desconto %" className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm" />
          <input value={affiliateCommission} onChange={(e) => setAffiliateCommission(e.target.value)} type="number" min="0" max="100" step="0.01" placeholder="Comissão %" className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm" />
        </div>
        <button onClick={saveAffiliate} disabled={saving} className="mt-4 rounded-xl bg-[#C6A75E] px-5 py-3 text-sm font-semibold text-[#111] disabled:opacity-50">
          Ativar afiliado
        </button>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ddd0] bg-white p-5">
        <h2 className="font-serif text-2xl text-[#5b2333]">Afiliados ativos</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead><tr className="border-b border-[#e8ddd0] text-gray-500"><th className="px-3 py-3">Usuário</th><th>Código</th><th>Desconto</th><th>Comissão</th><th>Pendente</th><th /></tr></thead>
            <tbody>
              {affiliates.map((item) => (
                <tr key={item._id} className="border-b border-[#f0e8df]">
                  <td className="px-3 py-3"><p className="font-medium">{item.name}</p><p className="text-xs text-gray-500">{item.email}</p></td>
                  <td>{item.affiliate?.couponCode}</td>
                  <td>{item.affiliate?.discountPercentage ?? 0}%</td>
                  <td>{item.affiliate?.commissionPercentage ?? 0}%</td>
                  <td>{money(Number(item.affiliate?.pendingBalance ?? 0))}</td>
                  <td><button onClick={() => removeAffiliate(item._id)} className="text-xs text-red-700 hover:underline">Desativar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ddd0] bg-white p-5">
        <h2 className="font-serif text-2xl text-[#5b2333]">Criar cupom</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="PRIMEIRACOMPRA" className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm" />
          <select value={couponType} onChange={(e) => setCouponType(e.target.value as Coupon["type"])} className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm">
            <option value="percentage">Percentual</option>
            <option value="fixed">Valor fixo</option>
            <option value="shipping">Frete</option>
            <option value="first_purchase">Primeiro pedido</option>
          </select>
          <input value={couponValue} onChange={(e) => setCouponValue(e.target.value)} type="number" min="0" step="0.01" placeholder="Valor" className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm" />
          <input value={couponLimit} onChange={(e) => setCouponLimit(e.target.value)} type="number" min="1" placeholder="Limite (opcional)" className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm" />
          <input value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} type="date" className="rounded-xl border border-[#e8ddd0] px-3 py-2 text-sm" />
        </div>
        <button onClick={saveCoupon} disabled={saving} className="mt-4 rounded-xl bg-[#5b2333] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          Criar cupom
        </button>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ddd0] bg-white p-5">
        <h2 className="font-serif text-2xl text-[#5b2333]">Cupons cadastrados</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead><tr className="border-b border-[#e8ddd0] text-gray-500"><th className="px-3 py-3">Código</th><th>Tipo</th><th>Valor</th><th>Uso</th><th>Estado</th><th /></tr></thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-[#f0e8df]">
                  <td className="px-3 py-3 font-medium">{coupon.code}</td>
                  <td>{coupon.type === "first_purchase" ? "Primeiro pedido" : coupon.type}</td>
                  <td>{coupon.type === "fixed" ? money(coupon.value) : `${coupon.value}%`}</td>
                  <td>{coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</td>
                  <td><button onClick={() => toggleCoupon(coupon)} className={coupon.active ? "text-green-700" : "text-gray-500"}>{coupon.active ? "Ativo" : "Inativo"}</button></td>
                  <td><button onClick={() => removeCoupon(coupon._id)} className="text-xs text-red-700 hover:underline">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
