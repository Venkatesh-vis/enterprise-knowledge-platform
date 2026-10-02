function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/10 ${className}`}
      aria-hidden="true"
    />
  );
}

function KnowledgeBaseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 bg-slate-200" />
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div className="flex gap-3.5">
          <Skeleton className="h-11 w-11 rounded-xl bg-slate-200" />
          <div className="space-y-2 pt-1.5">
            <Skeleton className="h-4 w-36 bg-slate-200" />
            <Skeleton className="h-3 w-24 bg-slate-200" />
          </div>
        </div>
        <Skeleton className="h-9 w-9 rounded-lg bg-slate-200" />
      </div>

      <div className="space-y-6 p-5">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full bg-slate-200" />
          <Skeleton className="h-3.5 w-4/5 bg-slate-200" />
          <Skeleton className="h-3.5 w-2/3 bg-slate-200" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-7 w-24 rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-28 bg-slate-200" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-4">
        <Skeleton className="h-3 w-24 bg-slate-200" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg bg-slate-200" />
          <Skeleton className="h-9 w-20 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBasesLoading() {
  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 shadow-lg sm:px-8 sm:py-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-2xl" />
              <Skeleton className="h-6 w-44 rounded-full" />
            </div>
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-4 w-[560px] max-w-full" />
            <div className="flex gap-2.5">
              <Skeleton className="h-9 w-36 rounded-xl" />
              <Skeleton className="h-9 w-36 rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 bg-slate-200" />
              <Skeleton className="h-3 w-28 bg-slate-200" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg bg-slate-200 sm:w-80" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <KnowledgeBaseCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
