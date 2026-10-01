function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={["animate-pulse rounded bg-slate-200/80", className].join(" ")}
    />
  );
}

function SummaryCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="mt-5 h-3 w-24" />
      <Skeleton className="mt-2 h-6 w-28" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

function UsageCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="mt-4 h-4 w-28" />
      <Skeleton className="mt-2 h-5 w-24" />
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
    </div>
  );
}

function PlanCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-7 h-9 w-32" />
      <Skeleton className="mt-2 h-3 w-28" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="mt-6 h-11 w-full rounded-xl" />
    </div>
  );
}

function InvoiceRows() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
      <div className="grid min-w-[820px] grid-cols-6 gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-3">
        {["w-20", "w-16", "w-16", "w-16", "w-20", "w-16"].map((width, index) => (
          <Skeleton key={index} className={["h-3", width].join(" ")} />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid min-w-[820px] grid-cols-6 items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-0"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="ml-auto h-9 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function BillingLoading() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">
        <Skeleton className="h-3 w-40 rounded-full" />
        <Skeleton className="mt-4 h-9 w-48" />
        <Skeleton className="mt-3 h-4 w-[520px] max-w-full" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SummaryCard key={index} />
        ))}
      </section>

      <section>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-6 w-44" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <UsageCard key={index} />
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <PlanCard key={index} />
          ))}
        </div>
      </section>

      <InvoiceRows />
    </div>
  );
}
