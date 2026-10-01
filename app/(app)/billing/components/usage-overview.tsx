import { Sparkles } from "lucide-react";

import { formatResource, RESOURCE_ICONS } from "./billing-utils";
import type { Billing } from "./billing-types";
import type { WorkspaceOverview } from "@/lib/workspace/types";

type UsageOverviewProps = {
  billing: Billing;
  workspace: WorkspaceOverview | null;
};

export function UsageOverview({ billing, workspace }: UsageOverviewProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Usage & entitlements
      </p>
      <h2 className="mt-1 text-xl font-semibold text-slate-950">
        Consumption overview
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Monitor the units that drive your current plan limits.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Object.entries(billing.plan.limits).map(([resource, limit]) => {
          const usedValue =
            resource === "documents"
              ? workspace?.documents
              : resource === "knowledge_bases"
                ? workspace?.knowledgeBases
                : resource === "team_members"
                  ? workspace?.members
                  : resource === "storage_mb"
                    ? workspace?.storageMb
                    : workspace?.aiQueriesMonth ?? billing.usage[resource];

          const hasValue = usedValue !== undefined;
          const used = usedValue ?? 0;

          const percent =
            limit === null || !limit
              ? 0
              : Math.min(
                  100,
                  Math.round((used / Number(limit)) * 100),
                );

          const Icon = RESOURCE_ICONS[resource] ?? Sparkles;

          const usageColors =
            limit === null
              ? {
                  icon: "bg-slate-100 text-slate-600",
                  percent: "text-slate-400",
                  progress: "bg-slate-950",
                }
              : percent >= 100
                ? {
                    icon: "bg-red-100 text-red-600",
                    percent: "text-red-600",
                    progress: "bg-red-500",
                  }
                : percent >= 90
                  ? {
                      icon: "bg-orange-100 text-orange-600",
                      percent: "text-orange-600",
                      progress: "bg-orange-500",
                    }
                  : percent >= 70
                    ? {
                        icon: "bg-amber-100 text-amber-600",
                        percent: "text-amber-600",
                        progress: "bg-amber-500",
                      }
                    : {
                        icon: "bg-slate-100 text-slate-600",
                        percent: "text-slate-400",
                        progress: "bg-slate-950",
                      };

          return (
            <div
              key={resource}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${usageColors.icon}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span
                  className={`text-xs font-medium ${usageColors.percent}`}
                >
                  {hasValue ? `${percent}%` : "—"}
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-slate-600">
                {formatResource(resource)}
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-950">
                {used.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-medium text-slate-400">
                  /{" "}
                  {limit === null
                    ? "Unlimited"
                    : Number(limit).toLocaleString("en-IN")}
                </span>
              </p>

              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full transition-all ${usageColors.progress}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
