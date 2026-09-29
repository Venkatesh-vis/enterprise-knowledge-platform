"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/app/shared/lib/api";
import { PricingCard } from "./pricing-card";
import { BillingSummary } from "./billing-summary";
import { BillingInvoices, type BillingInvoiceItem } from "./billing-invoices";

export type PlanId = "starter" | "business" | "enterprise";
export type BillingCycle = "monthly" | "yearly";
export interface PlanFeature { name: string; included: boolean; }
export interface PlanLimit { label: string; value: string; }
export interface Plan { id: PlanId; name: string; description: string; monthlyPrice: number; yearlyPrice: number; popular?: boolean; limits: PlanLimit[]; features: PlanFeature[]; }

type BillingResponse = {
  organization: { planKey: PlanId; billingCycle: BillingCycle; subscriptionStatus: string };
  razorpayKeyId: string;
  invoices: BillingInvoiceItem[];
};

type WindowWithRazorpay = Window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } };

const commonFeatures = ["Knowledge workspace", "Document management", "AI assistant", "Standard RBAC", "Advanced RBAC", "Audit logs", "Advanced analytics", "Priority support"];
const plans: Plan[] = [
  { id: "starter", name: "Starter", description: "For small teams getting started with centralized knowledge.", monthlyPrice: 999, yearlyPrice: 9590, limits: [{ label: "Users", value: "10" }, { label: "Storage", value: "25 GB" }, { label: "Knowledge bases", value: "5" }, { label: "Usage credits", value: "1,000 / month" }], features: commonFeatures.map((name) => ({ name, included: ["Knowledge workspace", "Document management", "AI assistant", "Standard RBAC"].includes(name) })) },
  { id: "business", name: "Business", description: "For growing organizations that need advanced controls and collaboration.", monthlyPrice: 2999, yearlyPrice: 28790, popular: true, limits: [{ label: "Users", value: "50" }, { label: "Storage", value: "100 GB" }, { label: "Knowledge bases", value: "20" }, { label: "Usage credits", value: "10,000 / month" }], features: commonFeatures.map((name) => ({ name, included: true })) },
  { id: "enterprise", name: "Enterprise", description: "For organizations requiring maximum control, security and scale.", monthlyPrice: 7999, yearlyPrice: 76790, limits: [{ label: "Users", value: "250" }, { label: "Storage", value: "500 GB" }, { label: "Knowledge bases", value: "100" }, { label: "Usage credits", value: "50,000 / month" }], features: commonFeatures.map((name) => ({ name, included: true })) },
];

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if ((window as WindowWithRazorpay).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("business");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [billing, setBilling] = useState<BillingResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ success: boolean; data: BillingResponse }>({ path: "/api/billing" })
      .then((response) => {
        setBilling(response.data);
        setSelectedPlan(response.data.organization.planKey);
        setBillingCycle(response.data.organization.billingCycle);
      })
      .catch(() => setError("Unable to load current billing details."));
  }, []);

  const selected = useMemo(() => plans.find((plan) => plan.id === selectedPlan) ?? plans[1], [selectedPlan]);

  async function continueToCheckout() {
    setBusy(true); setError(""); setNotice("");
    try {
      if (!(await loadRazorpay())) throw new Error("Razorpay Checkout could not be loaded.");
      const response = await apiRequest<{ success: boolean; data: { keyId: string; subscriptionId: string; planName: string; customer: { name: string; email: string } } }>({ path: "/api/billing", method: "POST", body: { plan: selectedPlan, billingCycle } });
      const Razorpay = (window as WindowWithRazorpay).Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const checkout = new Razorpay({
        key: response.data.keyId,
        subscription_id: response.data.subscriptionId,
        name: "Enterprise Knowledge Platform",
        description: `${response.data.planName} plan (${billingCycle})`,
        prefill: { name: response.data.customer.name, email: response.data.customer.email },
        theme: { color: "#0f172a" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (payment: { razorpay_subscription_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await apiRequest({ path: "/api/billing/verify", method: "POST", body: { subscriptionId: payment.razorpay_subscription_id, paymentId: payment.razorpay_payment_id, signature: payment.razorpay_signature } });
            setNotice("Payment verified. Your plan is now being activated.");
            setBilling((current) => current ? { ...current, organization: { ...current.organization, planKey: selectedPlan, billingCycle, subscriptionStatus: "ACTIVE" } } : current);
          } catch (verificationError) {
            setError(verificationError instanceof Error ? verificationError.message : "Payment verification failed. The webhook will reconcile the payment if it was successful.");
          } finally { setBusy(false); }
        },
      });
      checkout.open();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Plans & Billing</h1>
          <p className="mt-2 text-sm text-slate-500">Choose a plan for your organization. Payment and entitlements are verified on the server.</p>
          <div role="group" aria-label="Billing cycle" className="relative mt-6 inline-flex w-[220px] items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <motion.div layout className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-slate-950" style={{ left: billingCycle === "monthly" ? "4px" : "50%" }} />
            <button type="button" onClick={() => setBillingCycle("monthly")} aria-pressed={billingCycle === "monthly"} className={`relative z-10 flex-1 rounded-full px-5 py-2 text-sm font-medium ${billingCycle === "monthly" ? "text-white" : "text-slate-500"}`}>Monthly</button>
            <button type="button" onClick={() => setBillingCycle("yearly")} aria-pressed={billingCycle === "yearly"} className={`relative z-10 flex-1 rounded-full px-5 py-2 text-sm font-medium ${billingCycle === "yearly" ? "text-white" : "text-slate-500"}`}>Yearly</button>
          </div>
        </div>
        {(notice || error) && <div className={`mx-auto mt-6 max-w-3xl rounded-xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || notice}</div>}
        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-3">{plans.map((plan) => <PricingCard key={plan.id} plan={plan} selected={selectedPlan === plan.id} billingCycle={billingCycle} yearlyDiscount={20} onSelect={() => setSelectedPlan(plan.id)} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"><div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex gap-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Sparkles className="h-5 w-5" /></div><div><h2 className="text-base font-semibold text-slate-950">Predictable plan entitlements</h2><p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">Limits are enforced server-side for users, storage and feature access. A downgrade is rejected when current usage would exceed the target plan.</p><div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />Server-side enforcement</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />Webhook reconciliation</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />Invoice history</span></div></div></div></div></section>

      <BillingInvoices invoices={billing?.invoices ?? []} />
      <BillingSummary plan={selected} billingCycle={billingCycle} yearlyDiscount={20} busy={busy} currentPlan={billing?.organization.planKey === selectedPlan && billing?.organization.billingCycle === billingCycle} onContinue={continueToCheckout} />
    </main>
  );
}
