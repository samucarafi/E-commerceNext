import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/products/ProductCard";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const newProducts = products.filter((p) => p.isNewProduct).slice(0, 1);

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <section className="gradient-bg text-[#F5E6D3] py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10" />
        <div className="relative max-w-[1400px] mx-auto px-6 text-center">
          <p className="text-[#C6A75E] text-[10px] tracking-[0.35em] uppercase mb-5">
            Alta Perfumaria
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-extralight mb-6 tracking-[0.12em]">
            Essência <span className="text-[#C6A75E]">&</span> Luxo
          </h1>
          <p className="text-base md:text-lg mb-10 text-[#E8D8C3]/70 max-w-xl mx-auto leading-loose">
            Fragrâncias exclusivas das melhores maisons de perfumaria do mundo.
          </p>
          <Link href="/produtos" className="btn-gold inline-block px-10 py-3.5 rounded-full text-sm tracking-[0.18em] uppercase">
            Explorar Coleção
          </Link>
        </div>
      </section>

      {newProducts.length > 0 && (
        <section className="bg-[#171717] py-14">
          <div className="max-w-[1400px] mx-auto px-6">
            <p className="text-[#C6A75E] text-[10px] tracking-[0.3em] uppercase mb-1">Em Destaque</p>
            <h2 className="text-xl font-light text-[#F5E6D3] mb-10">Lançamentos</h2>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <Link href={`/produtos/${newProducts[0].slug}`} className="bg-[#1E1E1E] rounded-3xl aspect-square max-w-[420px] overflow-hidden">
                <Image
                  src={newProducts[0].image || "/images/default-perfume.jpg"}
                  alt={newProducts[0].name}
                  width={700}
                  height={700}
                  className="w-full h-full object-contain p-10 hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="text-center md:text-left">
                <span className="inline-block bg-[#C6A75E] text-[#111] text-[10px] font-bold px-3 py-1 rounded-full tracking-[0.15em] uppercase mb-5">
                  Novo
                </span>
                <p className="text-[#888] text-sm mb-2">{newProducts[0].brand}</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-light text-[#F5E6D3] mb-4">
                  {newProducts[0].name}
                </h2>
                <p className="text-[#999] leading-relaxed mb-6 max-w-sm">{newProducts[0].description}</p>
                <p className="text-2xl font-light text-[#C6A75E] mb-8">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(newProducts[0].price)}
                </p>
                <Link href={`/produtos/${newProducts[0].slug}`} className="inline-block bg-[#C6A75E] text-[#111] px-9 py-3.5 rounded-full text-sm font-semibold">
                  Ver Produto
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <main id="products" className="max-w-[1400px] mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#C6A75E] text-[10px] tracking-[0.28em] uppercase mb-1">Catálogo</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-light">Nossas Fragrâncias</h2>
          </div>
          <span className="text-xs text-gray-400">{products.length} produtos</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-7">
          {products.slice(0, 12).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </main>
    </div>
  );
}
