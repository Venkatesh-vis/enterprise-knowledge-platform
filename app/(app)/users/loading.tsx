function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function UsersLoading() {
  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-7 w-12" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-7 w-12" />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-80 max-w-full" />
            <Skeleton className="h-11 w-48" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44 max-w-full" />
                </div>
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <div className="mt-6 flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
