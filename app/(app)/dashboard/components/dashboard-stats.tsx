import type { LucideIcon } from "lucide-react";

type DashboardStatProps = {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
};

export function DashboardStat({
  label,
  value,
  description,
  icon: Icon,
  trend,
}: DashboardStatProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>

        {trend && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              trend.positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      <p className="mt-5 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}