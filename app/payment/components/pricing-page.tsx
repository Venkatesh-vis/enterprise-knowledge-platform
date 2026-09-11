"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PricingCard } from "./pricing-card";
import { BillingSummary } from "./billing-summary";

export type PlanId =
  | "starter"
  | "business"
  | "enterprise";

export type BillingCycle = "monthly" | "yearly";

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface PlanLimit {
  label: string;
  value: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  popular?: boolean;
  limits: PlanLimit[];
  features: PlanFeature[];
}

const YEARLY_DISCOUNT = 20;

const commonFeatures = [
  "Knowledge workspace",
  "Document management",
  "AI assistant",
  "Standard RBAC",
  "Advanced RBAC",
  "Audit logs",
  "Advanced analytics",
  "Priority support",
];

const createFeatures = (
  includedFeatures: string[],
): PlanFeature[] =>
  commonFeatures.map((name) => ({
    name,
    included: includedFeatures.includes(name),
  }));

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description:
      "For small teams getting started with centralized knowledge.",
    monthlyPrice: 999,

    limits: [
      {
        label: "Users",
        value: "10",
      },
      {
        label: "Storage",
        value: "25 GB",
      },
      {
        label: "Knowledge bases",
        value: "5",
      },
      {
        label: "Usage credits",
        value: "1,000 / month",
      },
    ],

    features: createFeatures([
      "Knowledge workspace",
      "Document management",
      "AI assistant",
      "Standard RBAC",
    ]),
  },

  {
    id: "business",
    name: "Business",
    description:
      "For growing organizations that need advanced controls and collaboration.",
    monthlyPrice: 2999,
    popular: true,

    limits: [
      {
        label: "Users",
        value: "50",
      },
      {
        label: "Storage",
        value: "100 GB",
      },
      {
        label: "Knowledge bases",
        value: "20",
      },
      {
        label: "Usage credits",
        value: "10,000 / month",
      },
    ],

    features: createFeatures([
      "Knowledge workspace",
      "Document management",
      "AI assistant",
      "Standard RBAC",
      "Advanced RBAC",
      "Audit logs",
      "Advanced analytics",
      "Priority support",
    ]),
  },

  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "For organizations requiring maximum control, security and scale.",
    monthlyPrice: 7999,

    limits: [
      {
        label: "Users",
        value: "250",
      },
      {
        label: "Storage",
        value: "500 GB",
      },
      {
        label: "Knowledge bases",
        value: "100",
      },
      {
        label: "Usage credits",
        value: "50,000 / month",
      },
    ],

    features: createFeatures([
      "Knowledge workspace",
      "Document management",
      "AI assistant",
      "Standard RBAC",
      "Advanced RBAC",
      "Audit logs",
      "Advanced analytics",
      "Priority support",
    ]),
  },
];

export function PricingPage() {
  const [selectedPlan, setSelectedPlan] =
    useState<PlanId>("business");

  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("monthly");

  const selected =
    plans.find(
      (plan) => plan.id === selectedPlan,
    ) ?? plans[1];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Pricing */}
      <section
        id="pricing"
        aria-labelledby="pricing-title"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col items-center">
          <h2
            id="pricing-title"
            className="sr-only"
          >
            Available plans
          </h2>

          {/* Billing toggle */}
          <div
            role="group"
            aria-label="Billing cycle"
            className="relative inline-flex w-[220px] items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm"
          >
            <motion.div
              layout
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                mass: 0.6,
              }}
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-slate-950 shadow-sm"
              style={{
                left: billingCycle === "monthly" ? "4px" : "50%",
              }}
            />

            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              aria-pressed={billingCycle === "monthly"}
              className={[
                "relative z-10 flex-1 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
                billingCycle === "monthly"
                  ? "text-white"
                  : "cursor-pointer text-slate-500 hover:text-slate-900",
              ].join(" ")}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              aria-pressed={billingCycle === "yearly"}
              className={[
                "relative z-10 flex-1 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
                billingCycle === "yearly"
                  ? "text-white"
                  : "cursor-pointer text-slate-500 hover:text-slate-900",
              ].join(" ")}
            >
              Yearly
            </button>
          </div>

        </div>

        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              selected={
                selectedPlan === plan.id
              }
              billingCycle={billingCycle}
              yearlyDiscount={YEARLY_DISCOUNT}
              onSelect={() =>
                setSelectedPlan(plan.id)
              }
            />
          ))}
        </div>
      </section>

      {/* Included usage */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Predictable monthly limits
              </h2>

              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
                Your subscription includes a defined number
                of users, storage, knowledge bases, and usage
                credits each month. These limits are managed
                as plan entitlements and can be increased by
                upgrading your plan.
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Check
                    className="h-4 w-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  Clear usage limits
                </span>

                <span className="flex items-center gap-2">
                  <Check
                    className="h-4 w-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  Monthly usage tracking
                </span>

                <span className="flex items-center gap-2">
                  <Check
                    className="h-4 w-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  Upgrade when you grow
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <BillingSummary
        plan={selected}
        billingCycle={billingCycle}
        yearlyDiscount={YEARLY_DISCOUNT}
        onContinue={() => {
          console.log(
            "Continue with:",
            selected.id,
            billingCycle,
          );
        }}
      />
    </main>
  );
}