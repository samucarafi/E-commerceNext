import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f8f5f2]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="h-4 w-56" />

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <Skeleton className="aspect-square w-full rounded-3xl" />

          <div className="flex flex-col justify-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-12 w-4/5" />
            <Skeleton className="mt-5 h-9 w-40" />

            <div className="mt-5 flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>

            <Skeleton className="mt-7 h-24 w-full" />
            <Skeleton className="mt-7 h-32 w-full rounded-2xl" />
            <Skeleton className="mt-7 h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
