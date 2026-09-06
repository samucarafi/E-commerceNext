import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-[1400px]">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-4 h-10 w-64" />

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-[#e8ddd0] bg-white p-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-4 h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
