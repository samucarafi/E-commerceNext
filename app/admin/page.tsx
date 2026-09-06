import Link from "next/link";

const cards = [
  ["Produtos", "Gerencie o catálogo.", "/admin/produtos"],
  ["Usuários", "Consulte os clientes e permissões.", "/admin/usuarios"],
  ["Pedidos", "Acompanhe vendas e entregas.", "/admin/pedidos"],
  ["Frete", "Configure modalidades, origem e credenciais.", "/admin/frete"],
];

export default function AdminPage() {
  return (
    <section>
      <p className="text-xs uppercase tracking-[0.2em] text-[#8d6b50]">
        Painel
      </p>
      <h1 className="mt-2 font-serif text-4xl text-[#2e2e2e]">
        Administração
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(([title, description, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-[#e8ddd0] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <h2 className="font-serif text-2xl text-[#5b2333]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
