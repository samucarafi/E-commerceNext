import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <section className="min-w-0 w-full max-w-full">
      <div className="min-w-0">
        <h1 className="font-serif text-3xl sm:text-4xl">Produtos</h1>
        <p className="mt-2 text-sm text-gray-500">
          {products.length} produto(s) encontrados no catálogo.
        </p>
      </div>

      <div className="mt-6 w-full max-w-full overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_90px_70px] gap-2 border-b border-[#eee4da] p-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:grid-cols-[minmax(0,1fr)_120px_100px] sm:gap-4 sm:p-4 sm:text-xs">
          <span>Produto</span>
          <span>Preço</span>
          <span>Estoque</span>
        </div>

        {products.map((product) => (
          <div
            key={product._id}
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_90px_70px] gap-2 border-b border-[#f2ece6] p-3 text-sm last:border-0 sm:grid-cols-[minmax(0,1fr)_120px_100px] sm:gap-4 sm:p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-[#2e2e2e]" title={product.name}>
                {product.name}
              </p>
              <p className="truncate text-xs text-gray-400" title={product.brand}>
                {product.brand}
              </p>
            </div>
            <span className="whitespace-nowrap">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            <span className="whitespace-nowrap">{product.stock}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
