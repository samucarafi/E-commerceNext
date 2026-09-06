import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f8f5f2] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-3 h-4 w-72" />

        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#e8ddd0] bg-white p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-3 h-4 w-64" />
                  <Skeleton className="mt-2 h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
