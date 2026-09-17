export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-11 w-28 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ),
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-20 animate-pulse border-b border-slate-100 bg-slate-50/70" />

        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map(
            (item) => (
              <div
                key={item}
                className="h-20 animate-pulse bg-white"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}