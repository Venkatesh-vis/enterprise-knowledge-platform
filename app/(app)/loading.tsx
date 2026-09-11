function Skeleton({className = ""}: {className?: string;}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-slate-200 ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div
      className="space-y-8"
      aria-label="Loading dashboard"
      role="status"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-36"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[420px]" />
      </div>

      <Skeleton className="h-56" />
    </div>
  );
}