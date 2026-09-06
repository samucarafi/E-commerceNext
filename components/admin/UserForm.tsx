"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  _id: string; name: string; email: string; role: "admin" | "user"; verified: boolean; phone?: string;
};

type FormState = {
  name: string; email: string; password: string; role: "admin" | "user"; verified: boolean; phone: string;
};

function getInitialForm(user?: User | null): FormState {
  return {
    name: user?.name ?? "", email: user?.email ?? "", password: "",
    role: user?.role ?? "user", verified: user?.verified ?? true, phone: user?.phone ?? "",
  };
}

export default function UserForm({ user, onSaved, onCancel }: {
  user?: User | null; onSaved: () => void; onCancel: () => void;
}) {
  const editing = Boolean(user);
  const [form, setForm] = useState<FormState>(() => getInitialForm(user));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // O formulário é um estado editável que precisa acompanhar a troca do usuário selecionado.
  useEffect(() => {
    // Sincronização intencional quando o usuário selecionado muda.
    setForm(getInitialForm(user));
    setError("");
  }, [user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch(editing ? `/api/admin/usuarios/${user?._id}` : "/api/admin/usuarios", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Não foi possível salvar o usuário.");
        return;
      }
      onSaved();
    } catch {
      setError("Não foi possível salvar o usuário.");
    } finally {
      setLoading(false);
    }
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#5b2333] px-7 py-5 text-[#f5e6d3]">
          <h2 className="font-semibold">{editing ? "Editar Usuário" : "Novo Usuário"}</h2>
          <p className="mt-1 text-xs text-[#d4a5a5]">Gerencie os dados e permissões da conta.</p>
        </div>
        <form onSubmit={submit} className="space-y-4 p-7">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <label className="block text-xs font-medium text-gray-500">Nome
            <input required minLength={3} className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-4 py-2.5 text-sm" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </label>
          <label className="block text-xs font-medium text-gray-500">E-mail
            <input required type="email" className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-4 py-2.5 text-sm" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </label>
          <label className="block text-xs font-medium text-gray-500">Senha {editing && <span className="font-normal text-gray-400">(deixe vazia para manter)</span>}
            <input required={!editing} minLength={6} type="password" className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-4 py-2.5 text-sm" value={form.password} onChange={(e) => update("password", e.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-gray-500">Perfil
              <select className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-4 py-2.5 text-sm" value={form.role} onChange={(e) => update("role", e.target.value as FormState["role"])}>
                <option value="user">Cliente</option><option value="admin">Admin</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-gray-500">Telefone
              <input className="mt-1 w-full rounded-xl border border-[#e8ddd0] px-4 py-2.5 text-sm" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.verified} onChange={(e) => update("verified", e.target.checked)} /> Conta verificada</label>
          <div className="flex justify-end gap-3 border-t border-[#f0e8e0] pt-5">
            <button type="button" onClick={onCancel} className="rounded-full border border-[#e8ddd0] px-5 py-2.5 text-sm">Cancelar</button>
            <button disabled={loading} className="rounded-full bg-[#5b2333] px-6 py-2.5 text-sm font-semibold text-[#f5e6d3] disabled:opacity-50">{loading ? "Salvando..." : editing ? "Atualizar" : "Criar usuário"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
