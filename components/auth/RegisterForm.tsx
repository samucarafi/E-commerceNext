"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const result = await register(form);

    if (!result.success) {
      setError(result.error ?? "Não foi possível criar sua conta.");
      return;
    }

    setSuccess(result.message ?? "Conta criada com sucesso.");
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <section className="w-full rounded-3xl border border-[#e8ddd0] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-[#8d6b50]">
        Royal Parfums
      </p>
      <h1 className="mt-2 font-serif text-3xl">Criar conta</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          required
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-[#e8ddd0] px-4 py-3 outline-none focus:border-[#8d6b50]"
        />
        <input
          required
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border border-[#e8ddd0] px-4 py-3 outline-none focus:border-[#8d6b50]"
        />
        <input
          required
          minLength={6}
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-xl border border-[#e8ddd0] px-4 py-3 outline-none focus:border-[#8d6b50]"
        />

        {error && <p className="text-sm text-red-700">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}

        <button className="btn-gold w-full rounded-xl px-5 py-3 font-semibold">
          Criar conta
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Já possui conta?{" "}
        <Link href="/login" className="font-medium text-[#5b2333]">
          Entrar
        </Link>
      </p>
    </section>
  );
}
