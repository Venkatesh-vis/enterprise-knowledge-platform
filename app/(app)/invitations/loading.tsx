export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-[320px] max-w-full animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-20 animate-pulse border-b border-slate-100 bg-slate-50" />

        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse border-b border-slate-100"
          />
        ))}
      </div>
    </div>
  );
}