"use client";

import {
  ArrowUpRight,
  Check,
  Loader2,
} from "lucide-react";

import {
  PAYMENT_PLANS,
  YEARLY_DISCOUNT,
} from "./billing-data";
import { yearlyMonthlyPrice } from "./billing-utils";
import type {
  Billing,
  BillingCycle,
  Plan,
} from "./billing-types";

type PricingPlansProps = {
  billing: Billing | null;
  plans: Plan[];
  billingCycle: BillingCycle;
  busy: string | null;
  onCheckout: (planId: string) => void;
  onUpgrade: (planId: string) => void;
};

export function PricingPlans({
  billing,
  plans,
  billingCycle,
  busy,
  onCheckout,
  onUpgrade,
}: PricingPlansProps) {
  const sortedPlans = [...plans].sort(
    (a, b) =>
      ["Starter", "Business", "Enterprise"].indexOf(a.name) -
      ["Starter", "Business", "Enterprise"].indexOf(b.name),
  );

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Compare plans</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-950">Plans & pricing</h2>
      <p className="mt-1 text-sm text-slate-500">The same Starter, Business, and Enterprise pricing shown on the Payment page.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {PAYMENT_PLANS.map((sourcePlan) => {
          const backendPlan = sortedPlans.find((plan) => plan.name.toLowerCase() === sourcePlan.name.toLowerCase());
          const current = billing?.plan.name.toLowerCase() === sourcePlan.name.toLowerCase();
          const currentPriceInPaise = billing?.plan.price ?? 0;
          const sourcePriceInPaise = sourcePlan.monthlyPrice * 100;
          const freeUser = currentPriceInPaise <= 0;
          const isUpgrade = !freeUser && !current && sourcePriceInPaise > currentPriceInPaise;
          const isLowerPlan = !freeUser && !current && sourcePriceInPaise < currentPriceInPaise;
          const monthlyPrice = billingCycle === "yearly" ? yearlyMonthlyPrice(sourcePlan.monthlyPrice) : sourcePlan.monthlyPrice;
          const annualTotal = monthlyPrice * 12;
          const canAct = Boolean(backendPlan && !current && !isLowerPlan && (!billing || freeUser || isUpgrade));
          const busyKey = freeUser ? backendPlan?.id : "upgrade:" + backendPlan?.id;

          return (
            <article
              key={sourcePlan.name}
              className={[
                "relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition",
                current ? "border-slate-950 shadow-lg shadow-slate-950/10" : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md",
              ].join(" ")}
            >
              {sourcePlan.name === "Business" && (
                <span className="absolute right-5 top-5 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold text-white">Most popular</span>
              )}

              <p className="text-lg font-semibold text-slate-950">{sourcePlan.name}</p>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{sourcePlan.description}</p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-3xl font-semibold tracking-tight text-slate-950">₹{monthlyPrice.toLocaleString("en-IN")}</span>
                <span className="mb-1 text-sm text-slate-400">/ month</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {billingCycle === "yearly" ? "Billed annually · ₹" + annualTotal.toLocaleString("en-IN") + " / year" : "Billed monthly"}
              </p>
              {billingCycle === "yearly" && (
                <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Save {YEARLY_DISCOUNT}%</span>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                {Object.entries(sourcePlan.limits).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{key.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-600">
                {[
                  "Knowledge workspace",
                  "Document management",
                  "AI assistant",
                  "Standard RBAC",
                  ...(sourcePlan.name !== "Starter" ? ["Advanced RBAC", "Audit logs", "Advanced analytics", "Priority support"] : []),
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={!canAct || Boolean(busy) || !backendPlan}
                onClick={() => {
                  if (!backendPlan) return;
                  if (freeUser) {
                    onCheckout(backendPlan.id);
                  } else if (isUpgrade) {
                    onUpgrade(backendPlan.id);
                  }
                }}
                className={[
                  "mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                  canAct ? "bg-slate-950 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {busy === busyKey && <Loader2 className="h-4 w-4 animate-spin" />}
                {current
                  ? "Current plan"
                  : freeUser
                    ? "Buy " + sourcePlan.name
                    : isUpgrade
                      ? "Upgrade to " + sourcePlan.name
                      : "Lower plan"}
                {canAct && <ArrowUpRight className="h-4 w-4" />}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
