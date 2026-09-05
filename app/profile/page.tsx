"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, MapPin, Save, UserRound } from "lucide-react";
import { apiRequest, useAuth, type Address } from "@/contexts/AuthContext";

const emptyAddress: Address = {
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  complement: "",
};

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setName(user.name);
    setPhone(user.phone ?? "");
    setAddress(user.addresses?.[0] ?? emptyAddress);
  }, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await apiRequest("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          phone,
          addresses: [address],
        }),
      });

      await refreshUser();
      setMessage("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <main className="min-h-screen bg-[#f8f5f2] p-10 text-center">Carregando perfil...</main>;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f8f5f2] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-3xl">Acesse sua conta</h1>
          <p className="mt-2 text-sm text-gray-500">Entre para visualizar e editar seu perfil.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-[#5b2333] px-5 py-3 text-sm font-semibold text-white"
          >
            Entrar
          </Link>
        </div>
      </main>
    );
  }

  const updateAddress = (key: keyof Address, value: string) =>
    setAddress((current) => ({ ...current, [key]: value }));

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 text-[#1c1c1c]">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#5b2333]"
        >
          <ArrowLeft size={16} />
          Voltar para a loja
        </Link>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b36]">Minha conta</p>
          <h1 className="mt-2 font-serif text-4xl">Meu perfil</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <UserRound className="text-[#9a7b36]" size={21} />
              <div>
                <h2 className="font-semibold">Dados pessoais</h2>
                <p className="text-xs text-gray-500">Atualize suas informações de contato.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Nome</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                  minLength={3}
                  required
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">E-mail</span>
                <input
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Telefone</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <MapPin className="text-[#9a7b36]" size={21} />
              <div>
                <h2 className="font-semibold">Endereço principal</h2>
                <p className="text-xs text-gray-500">Usado como referência no checkout.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-sm font-medium">CEP</span>
                <input
                  value={address.cep}
                  onChange={(event) => updateAddress("cep", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Estado</span>
                <input
                  value={address.state}
                  onChange={(event) => updateAddress("state", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Rua</span>
                <input
                  value={address.street}
                  onChange={(event) => updateAddress("street", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Número</span>
                <input
                  value={address.number}
                  onChange={(event) => updateAddress("number", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Bairro</span>
                <input
                  value={address.neighborhood}
                  onChange={(event) => updateAddress("neighborhood", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Cidade</span>
                <input
                  value={address.city}
                  onChange={(event) => updateAddress("city", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Complemento</span>
                <input
                  value={address.complement ?? ""}
                  onChange={(event) => updateAddress("complement", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#9a7b36]"
                />
              </label>
            </div>
          </section>

          {message && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
          )}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5b2333] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </main>
  );
}
