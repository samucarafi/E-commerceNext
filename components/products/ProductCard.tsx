import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card-hover bg-white overflow-hidden">
      <Link href={`/produtos/${product.slug}`} className="block">
        <div className="relative bg-[#f3efeb] aspect-square overflow-hidden">
          {product.isNewProduct && (
            <span className="absolute top-3 left-3 z-10 bg-[#C6A75E] text-[#111] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
              Novo
            </span>
          )}
          <Image
            src={product.image || "/images/default-perfume.jpg"}
            alt={product.name}
            width={700}
            height={700}
            className="w-full h-full object-contain p-5 hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{product.brand}</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-base font-medium line-clamp-1">{product.name}</h2>
          <p className="text-[#5B2333] mt-2">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
