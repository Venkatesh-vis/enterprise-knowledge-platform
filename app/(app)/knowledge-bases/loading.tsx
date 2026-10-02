function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

function KnowledgeBaseCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div className="flex gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBasesLoading() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-[520px] max-w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg sm:w-72" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <KnowledgeBaseCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
