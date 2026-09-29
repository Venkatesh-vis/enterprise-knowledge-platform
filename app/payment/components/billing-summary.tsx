import { ArrowRight, Check, Loader2 } from "lucide-react";
import type { BillingCycle, Plan } from "./pricing-page";

interface BillingSummaryProps {
  plan: Plan;
  billingCycle: BillingCycle;
  yearlyDiscount: number;
  busy: boolean;
  currentPlan: boolean;
  onContinue: () => void;
}

export function BillingSummary({ plan, billingCycle, yearlyDiscount, busy, currentPlan, onContinue }: BillingSummaryProps) {
  const displayedPrice = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <section aria-label="Selected plan" className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">{plan.name} plan</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{billingCycle === "yearly" ? "Yearly" : "Monthly"}</span>
            {billingCycle === "yearly" && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Save {yearlyDiscount}%</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="font-medium text-slate-700">₹{displayedPrice.toLocaleString("en-IN")}{billingCycle === "yearly" ? "/year" : "/month"}</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" />{plan.limits.slice(0, 2).map((limit) => `${limit.value} ${limit.label.toLowerCase()}`).join(" · ")}</span>
          </div>
        </div>
        <button type="button" disabled={busy || currentPlan} onClick={onContinue} className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : currentPlan ? "Current plan" : <>Continue with {plan.name}<ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </section>
  );
}
