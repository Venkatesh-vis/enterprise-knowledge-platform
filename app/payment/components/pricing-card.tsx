"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { BillingCycle, Plan } from "./pricing-page";

interface PricingCardProps {
  plan: Plan;
  selected: boolean;
  billingCycle: BillingCycle;
  yearlyDiscount: number;
  onSelect: () => void;
}

export function PricingCard({ plan, selected, billingCycle, yearlyDiscount, onSelect }: PricingCardProps) {
  const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const period = billingCycle === "yearly" ? "/ year" : "/ month";

  return (
    <motion.button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`Select ${plan.name} plan`} whileHover={{ y: -4 }} whileTap={{ scale: 0.99 }} className={`relative flex min-h-[620px] w-full flex-col rounded-2xl p-[1px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${selected ? "bg-gradient-to-br from-indigo-400 via-violet-500 to-cyan-400 shadow-xl shadow-indigo-500/20" : "bg-slate-200 shadow-sm"}`}>
      <div className={`relative flex h-full flex-1 flex-col overflow-hidden rounded-[15px] p-6 sm:p-7 ${selected ? "bg-gradient-to-br from-indigo-50 via-white to-cyan-50" : "bg-white"}`}>
        {billingCycle === "yearly" && <span className="absolute right-4 top-4 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Save {yearlyDiscount}%</span>}
        <div className="min-h-[108px] pr-16">
          {plan.popular ? <span className="mb-3 inline-flex rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Most popular</span> : <div className="mb-3 h-[26px]" />}
          <h2 className="text-lg font-semibold text-slate-950">{plan.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{plan.description}</p>
        </div>

        <div className="mt-6 min-h-[90px]">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-semibold tracking-tight text-slate-950">₹{price.toLocaleString("en-IN")}</span>
            <span className="mb-1 text-sm text-slate-500">{period}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{billingCycle === "yearly" ? "Billed once per year" : "Billed monthly"}</p>
        </div>

        <div className="mt-7 border-t border-slate-200/70 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan includes</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
            {plan.limits.map((limit) => <div key={limit.label}><dt className="text-xs text-slate-400">{limit.label}</dt><dd className="mt-0.5 text-sm font-semibold text-slate-700">{limit.value}</dd></div>)}
          </dl>
        </div>

        <div className="mt-7 flex-1 border-t border-slate-200/70 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Features</p>
          <ul className="mt-4 space-y-3">
            {plan.features.map((feature) => <li key={feature.name} className="flex items-start gap-3 text-sm">{feature.included ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}<span className={feature.included ? "text-slate-700" : "text-slate-400"}>{feature.name}</span></li>)}
          </ul>
        </div>

        <div className={`mt-6 flex h-10 items-center justify-center rounded-lg border text-sm font-medium ${selected ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}>{selected ? "Selected" : "Select plan"}</div>
      </div>
    </motion.button>
  );
}
