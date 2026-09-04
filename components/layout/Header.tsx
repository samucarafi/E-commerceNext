import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-[#1C1C1C] border-b border-[#242424] sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          <Link href="/produtos" className="text-[#F5E6D3] text-xs tracking-widest uppercase">
            Coleção
          </Link>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/images/ROYAL.png"
              alt="Royal Parfums"
              width={150}
              height={70}
              priority
              className="h-14 w-auto object-contain"
            />
          </Link>

          <nav className="flex items-center gap-5">
            <Link href="/login" className="text-[#F5E6D3] text-xs hover:text-[#C6A75E]">Entrar</Link>
            <Link href="/carrinho" className="text-[#F5E6D3] text-xs hover:text-[#C6A75E]">Sacola</Link>
          </nav>
        </div>
        <div className="pb-3">
          <form action="/produtos" className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 border border-[#242424] rounded-full px-4 py-2.5 bg-[#111]">
              <span className="text-[#C6A75E]">⌕</span>
              <input
                name="q"
                placeholder="Buscar fragrância, marca, nota olfativa..."
                className="bg-transparent outline-none text-sm flex-1 text-[#F5E6D3] placeholder:text-gray-600"
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
