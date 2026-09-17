export default function UserDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-200" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-48 animate-pulse bg-slate-50" />
        <div className="h-32 animate-pulse" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-20 animate-pulse bg-slate-50" />
        <div className="h-64 animate-pulse" />
      </div>
    </div>
  );
}