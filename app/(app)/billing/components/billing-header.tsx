"use client";

import {
  CreditCard,
} from "lucide-react";

import type { BillingCycle } from "./billing-types";

type BillingHeaderProps = {
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
};

export function BillingHeader({
  billingCycle,
  onBillingCycleChange,
}: BillingHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-200">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Subscription & billing</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Billing workspace</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Manage your subscription, review invoices, and monitor the units that drive your plan.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-white/10 bg-white/10 p-1 backdrop-blur">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              aria-pressed={billingCycle === cycle}
              onClick={() => onBillingCycleChange(cycle)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                billingCycle === cycle ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:text-white",
              ].join(" ")}
            >
              {cycle === "monthly" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
