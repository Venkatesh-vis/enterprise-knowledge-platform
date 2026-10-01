import {
  CreditCard,
  HardDrive,
  ReceiptText,
  Users,
} from "lucide-react";

import { formatDate } from "./billing-utils";
import type { Billing } from "./billing-types";
import type { WorkspaceOverview } from "@/lib/workspace/types";

type BillingSummaryProps = {
  billing: Billing;
  workspace: WorkspaceOverview | null;
  busy: string | null;
  onCancel: () => void;
};

export function BillingSummary({
  billing,
  workspace,
  busy,
  onCancel,
}: BillingSummaryProps) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Current plan",
            value: billing.plan.name,
            detail: billing.subscriptionStatus === "FREE" ? "Free entitlement" : billing.subscriptionStatus,
            icon: CreditCard,
          },
          {
            label: "Next billing date",
            value:
              billing.subscriptionStatus !== "FREE"
                ? formatDate(billing.currentPeriodEnd)
                : "Not scheduled",
            detail: billing.cancelAtPeriodEnd ? "Ends at period close" : "Scheduled renewal",
            icon: ReceiptText,
          },
          {
            label: "Team seats",
            value:
              String(workspace?.members ?? 0) +
              " / " +
              (billing.plan.limits.team_members === null ? "∞" : String(billing.plan.limits.team_members ?? "—")),
            detail: "Active team member usage",
            icon: Users,
          },
          {
            label: "Storage",
            value: (workspace?.storageMb ?? 0).toLocaleString("en-IN") + " MB",
            detail:
              billing.plan.limits.storage_mb === null
                ? "Unlimited"
                : String(billing.plan.limits.storage_mb ?? "—") + " MB limit",
            icon: HardDrive,
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
          </div>
        ))}
      </section>

      {billing.subscriptionStatus !== "FREE" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {billing.cancelAtPeriodEnd ? "Cancellation scheduled" : "Active subscription"}
                </span>
                {billing.currentPeriodStart && (
                  <span className="text-xs text-slate-400">
                    {formatDate(billing.currentPeriodStart)} — {formatDate(billing.currentPeriodEnd)}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">{billing.plan.name} subscription</h2>
              <p className="mt-1 text-sm text-slate-500">Manage renewal timing without losing access before the current period ends.</p>
            </div>

            {!billing.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={onCancel}
                disabled={Boolean(busy)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                {busy === "cancel" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />}
                Schedule cancellation
              </button>
            )}
          </div>
        </section>
      )}
    </>
  );
}
