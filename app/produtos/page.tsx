import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/products/ProductCard";
import CatalogFilters from "@/components/products/CatalogFilters";
import Pagination from "@/components/products/Pagination";
import type { Product } from "@/types/product";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Perfumes e Fragrâncias",
  description:
    "Explore o catálogo de perfumes, decantes e fragrâncias da Royal Parfums.",
};

export const revalidate = 60;

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string;
  type?: string;
  gender?: string;
  category?: string;
  new?: string;
  sort?: string;
  page?: string;
};

function getText(value: string | undefined) {
  return value?.trim().toLocaleLowerCase("pt-BR") ?? "";
}

function filterProducts(products: Product[], params: SearchParams) {
  const q = getText(params.q);

  let result = products.filter((product) => {
    const matchesQuery =
      !q ||
      getText(product.name).includes(q) ||
      getText(product.brand).includes(q) ||
      getText(product.category).includes(q);

    const matchesType = !params.type || product.type === params.type;
    const matchesGender = !params.gender || product.gender === params.gender;
    const matchesCategory =
      !params.category || product.category === params.category;
    const matchesNew = params.new !== "1" || product.isNewProduct;

    return (
      matchesQuery &&
      matchesType &&
      matchesGender &&
      matchesCategory &&
      matchesNew
    );
  });

  switch (params.sort) {
    case "az":
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      );
      break;
    case "price-asc":
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price-desc":
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "popularity":
      result = [...result].sort(
        (a, b) => Number(b.popularity ?? 0) - Number(a.popularity ?? 0),
      );
      break;
    default:
      break;
  }

  return result;
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [products, params] = await Promise.all([getProducts(), searchParams]);
  const filteredProducts = filterProducts(products, params);

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const requestedPage = Number(params.page ?? 1);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;

  const start = (page - 1) * PAGE_SIZE;
  const pageProducts = filteredProducts.slice(start, start + PAGE_SIZE);

  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key !== "page" && value) query[key] = value;
  }

  return (
    <main className="min-h-screen bg-[#F8F5F2]">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-14">
        <header className="mb-8">
          <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-[#C6A75E]">
            Catálogo
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light">
            Nossas Fragrâncias
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "produto encontrado"
              : "produtos encontrados"}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <CatalogFilters
                categories={categories}
                initial={{
                  q: params.q,
                  type: params.type,
                  gender: params.gender,
                  category: params.category,
                  newOnly: params.new === "1",
                  sort: params.sort,
                }}
              />
            </div>
          </aside>

          <section>
            <div className="mb-5 lg:hidden">
              <details className="rounded-2xl border border-[#e8ddd0] bg-white p-1">
                <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-sm font-semibold text-[#5b2333]">
                  Filtrar e ordenar
                </summary>
                <div className="p-3">
                  <CatalogFilters
                    categories={categories}
                    initial={{
                      q: params.q,
                      type: params.type,
                      gender: params.gender,
                      category: params.category,
                      newOnly: params.new === "1",
                      sort: params.sort,
                    }}
                  />
                </div>
              </details>
            </div>

            {pageProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 md:gap-7">
                {pageProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#d8cabb] bg-white px-6 py-20 text-center">
                <p className="font-serif text-2xl text-[#2e2e2e]">
                  Nenhuma fragrância encontrada
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Tente remover alguns filtros ou pesquisar por outro termo.
                </p>
                <Link
                  href="/produtos"
                  className="mt-6 inline-block rounded-full bg-[#5b2333] px-6 py-3 text-sm font-semibold text-white"
                >
                  Limpar filtros
                </Link>
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} query={query} />
          </section>
        </div>
      </div>
    </main>
  );
}
