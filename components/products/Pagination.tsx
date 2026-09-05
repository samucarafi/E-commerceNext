import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  query: Record<string, string>;
};

export default function Pagination({ page, totalPages, query }: Props) {
  if (totalPages <= 1) return null;

  const createHref = (nextPage: number) => {
    const params = new URLSearchParams(query);
    params.set("page", String(nextPage));
    return `/produtos?${params.toString()}`;
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginação">
      {page > 1 && (
        <Link
          href={createHref(page - 1)}
          className="rounded-full border border-[#e8ddd0] bg-white px-4 py-2 text-sm text-[#5b2333] hover:border-[#c6a75e]"
        >
          Anterior
        </Link>
      )}

      <span className="px-3 text-xs text-gray-500">
        Página {page} de {totalPages}
      </span>

      {page < totalPages && (
        <Link
          href={createHref(page + 1)}
          className="rounded-full border border-[#e8ddd0] bg-white px-4 py-2 text-sm text-[#5b2333] hover:border-[#c6a75e]"
        >
          Próxima
        </Link>
      )}
    </nav>
  );
}
