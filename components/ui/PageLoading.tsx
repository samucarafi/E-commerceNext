export default function PageLoading({
  label = "Carregando...",
}: {
  label?: string;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#f8f5f2] px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#e8ddd0]" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#5b2333]" />
        </div>

        <div>
          <p className="font-serif text-xl text-[#2e2e2e]">{label}</p>
          <p className="mt-1 text-xs text-gray-500">
            Aguarde só um momento.
          </p>
        </div>
      </div>
    </main>
  );
}
