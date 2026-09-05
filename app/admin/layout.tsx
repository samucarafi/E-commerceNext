import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <header className="border-b border-[#e8ddd0] bg-[#1c1c1c] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="font-serif text-xl">Royal Parfums</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
              Administração
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            Voltar à loja
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] sm:px-6">
        <aside className="h-fit rounded-2xl border border-[#e8ddd0] bg-white p-3">
          <nav className="grid gap-1 text-sm">
            <Link className="rounded-xl px-3 py-2 hover:bg-[#f8f5f2]" href="/admin">
              Dashboard
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-[#f8f5f2]" href="/admin/produtos">
              Produtos
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-[#f8f5f2]" href="/admin/usuarios">
              Usuários
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-[#f8f5f2]" href="/admin/pedidos">
              Pedidos
            </Link>
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
