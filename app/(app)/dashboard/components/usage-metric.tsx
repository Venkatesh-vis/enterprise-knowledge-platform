import type { LucideIcon } from "lucide-react";

type UsageMetricProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  percentage: number;
};

export function UsageMetric({
  icon: Icon,
  label,
  value,
  detail,
  percentage,
}: UsageMetricProps) {
  const safePercentage = Math.min(
    100,
    Math.max(0, percentage),
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />

          <span className="text-sm font-medium text-slate-700">
            {label}
          </span>
        </div>

        <span className="text-xs text-slate-400">
          {detail}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">
          {value}
        </span>

        <span className="text-xs font-medium text-slate-500">
          {safePercentage}%
        </span>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercentage}
      >
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500"
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
}