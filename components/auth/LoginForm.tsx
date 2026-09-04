"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const result = await login({ email, password });

    if (!result.success) {
      setError(result.error ?? "Não foi possível entrar.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <section className="w-full rounded-3xl border border-[#e8ddd0] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-[#8d6b50]">
        Royal Parfums
      </p>
      <h1 className="mt-2 font-serif text-3xl">Bem-vindo de volta</h1>
      <p className="mt-2 text-sm text-gray-500">
        Entre para acompanhar seus pedidos e agilizar suas compras.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">E-mail</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[#e8ddd0] px-4 py-3 outline-none focus:border-[#8d6b50]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Senha</span>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[#e8ddd0] px-4 py-3 outline-none focus:border-[#8d6b50]"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="btn-gold w-full rounded-xl px-5 py-3 font-semibold disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Ainda não possui conta?{" "}
        <Link href="/cadastro" className="font-medium text-[#5b2333]">
          Criar conta
        </Link>
      </p>
    </section>
  );
}
