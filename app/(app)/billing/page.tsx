"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, CreditCard, Loader2, XCircle } from "lucide-react";
import { apiRequest } from "@/app/shared/lib/api";
import { useAuthStore } from "@/app/shared/store/auth-store";

declare global { interface Window { Razorpay: any } }

type Plan = { id: string; name: string; description: string | null; interval: string; price: number; currency: string; features: string[]; limits: Record<string, number | null> };
type Billing = { plan: Plan; subscriptionStatus: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; usage: Record<string, number> };

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("razorpay-checkout-script") as HTMLScriptElement | null;
    if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay Checkout.")), { once: true }); return; }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const user = useAuthStore((state) => state.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const [plansResponse, billingResponse] = await Promise.all([
        apiRequest<{ success: boolean; data: { plans: Plan[] } }>({ path: "/api/billing/plans" }),
        apiRequest<{ success: boolean; data: Billing }>({ path: "/api/billing" }),
      ]);
      setPlans(plansResponse.data.plans);
      setBilling(billingResponse.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load billing.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);

  const checkout = async (planId: string) => {
    setBusy(planId); setError(""); setMessage("");
    try {
      await loadRazorpay();
      const created = await apiRequest<{ data: { subscriptionId: string; razorpaySubscriptionId: string; razorpayKeyId: string; plan: Plan } }>({
        path: "/api/billing/checkout", method: "POST", body: { planId, idempotencyKey: crypto.randomUUID() },
      });
      const rzp = new window.Razorpay({
        key: created.data.razorpayKeyId,
        subscription_id: created.data.razorpaySubscriptionId,
        name: "Enterprise Knowledge Platform",
        description: created.data.plan.name,
        prefill: { name: user?.name ?? "", email: user?.email ?? "" },
        handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
          try {
            await apiRequest({ path: "/api/billing/verify", method: "POST", body: { subscriptionId: created.data.subscriptionId, razorpaySubscriptionId: response.razorpay_subscription_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature } });
            setMessage("Payment verified. Your subscription will become active from Razorpay's subscription webhook.");
          } catch (cause) { setError(cause instanceof Error ? cause.message : "Payment verification failed."); }
          finally { await refresh(); }
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rzp.on("payment.failed", (response: any) => setError(response?.error?.description ?? "Payment failed."));
      rzp.open();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Checkout failed."); }
    finally { setBusy(null); }
  };

  const cancel = async () => {
    setBusy("cancel"); setError(""); setMessage("");
    try {
      await apiRequest({ path: "/api/billing/cancel", method: "POST", body: { cancelAtPeriodEnd: true } });
      setMessage("Cancellation is scheduled for the end of the current billing period.");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to cancel subscription."); }
    finally { setBusy(null); }
  };

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Loading billing...</div>;

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-semibold text-slate-950">Billing</h1><p className="mt-1 text-sm text-slate-500">Manage your organization subscription, plan limits, and payment history.</p></div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="mr-2 inline h-4 w-4" />{message}</div>}

      {billing && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current plan</p><p className="mt-1 text-2xl font-semibold text-slate-950">{billing.plan.name}</p><p className="mt-1 text-sm text-slate-500">Status: {billing.subscriptionStatus}</p>{billing.currentPeriodEnd && <p className="mt-1 text-xs text-slate-400">Current period ends {new Date(billing.currentPeriodEnd).toLocaleDateString("en-IN")}</p>}</div>
          {billing.subscriptionStatus !== "FREE" && !billing.cancelAtPeriodEnd && <button type="button" onClick={cancel} disabled={busy === "cancel"} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{busy === "cancel" ? "Cancelling..." : "Cancel at period end"}</button>}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">{Object.entries(billing.plan.limits).map(([resource, limit]) => <div key={resource} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-400">{resource.replaceAll("_", " ")}</p><p className="mt-1 text-lg font-semibold">{billing.usage[resource] ?? 0} / {limit === null ? "Unlimited" : limit}</p></div>)}</div>
      </section>}

      <section><div className="mb-4"><h2 className="text-lg font-semibold text-slate-950">Plans</h2><p className="mt-1 text-sm text-slate-500">All features remain discoverable. Protected operations are enforced by the backend.</p></div>
        <div className="grid gap-5 md:grid-cols-3">{plans.map((plan) => {
          const current = billing?.plan.id === plan.id;
          return <div key={plan.id} className={`rounded-2xl border bg-white p-6 shadow-sm ${current ? "border-slate-950" : "border-slate-200"}`}>
            <CreditCard className="h-5 w-5 text-slate-500" /><h3 className="mt-4 text-lg font-semibold">{plan.name}</h3><p className="mt-1 min-h-10 text-sm text-slate-500">{plan.description}</p>
            <p className="mt-5 text-2xl font-bold">{plan.price === 0 ? "Free" : `₹${(plan.price / 100).toLocaleString("en-IN")}`} {plan.price > 0 && <span className="text-sm font-medium text-slate-400">/{plan.interval.toLowerCase()}</span>}</p>
            <div className="mt-5 space-y-2 text-sm text-slate-600">{plan.features.map((feature) => <p key={feature}><CheckCircle2 className="mr-2 inline h-4 w-4" />{feature.replaceAll("_", " ").toLowerCase()}</p>)}</div>
            <button type="button" onClick={() => void checkout(plan.id)} disabled={current || plan.price === 0 || Boolean(busy)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}{current ? "Current plan" : plan.price === 0 ? "Included" : "Choose plan"}</button>
          </div>;
        })}</div>
      </section>

      {billing && billing.subscriptionStatus !== "FREE" && <div className="flex items-center gap-2 text-xs text-slate-400"><XCircle className="h-4 w-4" />Subscription state is reconciled from Razorpay webhooks.</div>}
    </div>
  );
}
