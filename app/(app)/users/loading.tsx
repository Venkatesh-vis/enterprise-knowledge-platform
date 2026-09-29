function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200/80 ${className}`} />;
}

function Row() {
  return (
    <div className="grid min-w-[760px] grid-cols-[minmax(280px,1fr)_140px_150px_64px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="ml-auto h-9 w-9 rounded-lg" />
    </div>
  );
}

export default function UsersLoading() {
  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="mt-4 h-9 w-28" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4"><Skeleton className="h-4 w-28" /><Skeleton className="mt-3 h-7 w-12" /></div>)}
      </section>
      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2"><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-80 max-w-full" /></div>
          <div className="flex gap-2"><Skeleton className="h-11 w-80 max-w-full" /><Skeleton className="h-11 w-48" /></div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-w-[760px] grid-cols-[minmax(280px,1fr)_140px_150px_64px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3">{["w-24", "w-12", "w-16", "w-14"].map((width, index) => <Skeleton key={index} className={`h-3 ${width}`} />)}</div>
          {Array.from({ length: 8 }).map((_, index) => <Row key={index} />)}
        </div>
      </section>
    </div>
  );
}
