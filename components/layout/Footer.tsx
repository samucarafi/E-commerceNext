import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1C1C1C] text-[#F5E6D3]">
      <div className="mx-auto max-w-[1400px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-[family-name:var(--font-playfair)] text-3xl tracking-[0.18em]">
              ROYAL
            </p>
            <p className="mt-3 max-w-xs text-sm font-light leading-6 text-gray-400">
              Perfumaria de luxo, fragrâncias selecionadas e decantes para você
              encontrar sua assinatura.
            </p>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A75E]">
              Navegação
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <Link className="block hover:text-[#F5E6D3]" href="/">
                Início
              </Link>
              <Link className="block hover:text-[#F5E6D3]" href="/produtos">
                Produtos
              </Link>
              <Link
                className="block hover:text-[#F5E6D3]"
                href="/produtos?type=Perfume"
              >
                Perfumes
              </Link>
              <Link
                className="block hover:text-[#F5E6D3]"
                href="/produtos?type=Decante"
              >
                Decantes
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A75E]">
              Minha conta
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <Link className="block hover:text-[#F5E6D3]" href="/profile">
                Meu Perfil
              </Link>
              <Link className="block hover:text-[#F5E6D3]" href="/orders">
                Meus Pedidos
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A75E]">
              Royal
            </p>
            <p className="text-sm leading-6 text-gray-400">
              Uma experiência elegante do primeiro olhar até o pedido.
            </p>
            <div className="mt-5 flex gap-5 text-sm">
              <a
                href="https://instagram.com/roya.lparfums"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#888] transition-colors hover:text-[#C6A75E]"
              >
                Instagram
              </a>
              <a
                href="https://wa.me/5521989291846"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#888] transition-colors hover:text-[#C6A75E]"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#2A2A2A] pt-5 text-center text-xs text-gray-500">
          <p className="mb-2 text-[10px] tracking-wide text-[#555]">
            Desenvolvido por{" "}
            <a
              href="https://portfolio-indol-delta-osca4gno4i.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-[#C6A75E]"
            >
              Samuel Rafino
            </a>
          </p>
          <p>
            © {new Date().getFullYear()} Royal Parfums. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
