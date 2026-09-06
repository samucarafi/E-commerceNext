"use client";

import { useEffect, useState } from "react";
import UserForm from "@/components/admin/UserForm";

type User = {
  _id: string; name: string; email: string; role: "admin" | "user";
  verified: boolean; createdAt?: string; phone?: string;
};

export default function UsuariosAdminClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/admin/usuarios", { credentials: "include", cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok) { setError(data.error || "Não foi possível carregar os usuários."); return; }
        setUsers(data);
      } catch {
        if (active) setError("Não foi possível carregar os usuários.");
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  async function remove(user: User) {
    if (!window.confirm(`Excluir "${user.name}"? Esta ação não pode ser desfeita.`)) return;
    const response = await fetch(`/api/admin/usuarios/${user._id}`, { method: "DELETE", credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || "Não foi possível excluir o usuário."); return; }
    const refreshed = await fetch("/api/admin/usuarios", { credentials: "include", cache: "no-store" });
    const refreshedData = await refreshed.json().catch(() => []);
    if (refreshed.ok) setUsers(refreshedData);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div><h1 className="text-xl font-semibold text-[#1c1c1c]">Clientes</h1><p className="mt-1 text-sm text-gray-400">{users.length} cadastrado{users.length === 1 ? "" : "s"}</p></div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="rounded-full bg-[#c6a75e] px-5 py-2.5 text-sm font-semibold text-[#111]">+ Novo Usuário</button>
      </div>
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="overflow-hidden rounded-2xl border border-[#eee8e0] bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-[#eee8e0] bg-[#faf7f4]">
            <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Usuário</th>
            <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Email</th>
            <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Função</th>
            <th className="px-5 py-3.5 text-left text-[10px] uppercase tracking-wider text-gray-400">Desde</th>
            <th className="px-5 py-3.5 text-right text-[10px] uppercase tracking-wider text-gray-400">Ações</th>
          </tr></thead>
          <tbody className="divide-y divide-[#f5f0eb]">
            {users.map((user) => <tr key={user._id} className="hover:bg-[#faf7f4]">
              <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b2333]/10 text-xs font-semibold text-[#5b2333]">{user.name.charAt(0).toUpperCase()}</div><span className="font-medium">{user.name}</span></div></td>
              <td className="px-5 py-4 text-xs text-gray-500">{user.email}</td>
              <td className="px-5 py-4"><span className="rounded-full bg-[#5b2333]/10 px-3 py-1 text-[10px] font-semibold uppercase text-[#5b2333]">{user.role === "admin" ? "Admin" : "Cliente"}</span></td>
              <td className="px-5 py-4 text-xs text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "—"}</td>
              <td className="px-5 py-4"><div className="flex justify-end gap-3"><button onClick={() => { setEditing(user); setShowForm(true); }} className="text-xs font-medium text-[#5b2333] hover:text-[#c6a75e]">Editar</button><button onClick={() => remove(user)} className="text-xs font-medium text-gray-400 hover:text-red-500">Excluir</button></div></td>
            </tr>)}
          </tbody>
        </table>{users.length === 0 && <div className="py-16 text-center text-sm text-gray-400">Nenhum usuário encontrado.</div>}</div>
      </div>
      {showForm && <UserForm user={editing} onSaved={() => { setShowForm(false); setEditing(null); }} onCancel={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}
