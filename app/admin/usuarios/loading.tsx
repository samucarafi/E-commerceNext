import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="space-y-4 p-5">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
