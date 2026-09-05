import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <section>
      <h1 className="font-serif text-4xl">Produtos</h1>
      <p className="mt-2 text-sm text-gray-500">
        {products.length} produto(s) encontrados no catálogo.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white">
        <div className="grid grid-cols-[1fr_120px_100px] gap-4 border-b border-[#eee4da] p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <span>Produto</span>
          <span>Preço</span>
          <span>Estoque</span>
        </div>

        {products.map((product) => (
          <div
            key={product._id}
            className="grid grid-cols-[1fr_120px_100px] gap-4 border-b border-[#f2ece6] p-4 text-sm last:border-0"
          >
            <div>
              <p className="font-medium text-[#2e2e2e]">{product.name}</p>
              <p className="text-xs text-gray-400">{product.brand}</p>
            </div>
            <span>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            <span>{product.stock}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
