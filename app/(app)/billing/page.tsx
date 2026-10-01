"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  CreditCard,
  Database,
  Download,
  FileText,
  HardDrive,
  Loader2,
  ReceiptText,
  Sparkles,
  Users,
} from "lucide-react";

import { apiRequest } from "@/app/shared/lib/api";
import { useAuthStore } from "@/app/shared/store/auth-store";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  interval: string;
  price: number;
  currency: string;
  features: string[];
  limits: Record<string, number | null>;
};

type Payment = {
  id: string;
  paymentId: string;
  invoiceId?: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  capturedAt: string | null;
  createdAt: string | null;
  refundedAmount: number;
};

type Billing = {
  plan: Plan;
  subscriptionStatus: string;
  subscriptionId: string | null;
  razorpaySubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  usage: Record<string, number>;
  payments: Payment[];
};

const PAYMENT_PLANS = [
  {
    name: "Starter",
    description: "For small teams getting started with centralized knowledge.",
    monthlyPrice: 999,
    limits: {
      users: "10",
      storage: "25 GB",
      knowledge_bases: "5",
      usage_credits: "1,000 / month",
    },
  },
  {
    name: "Business",
    description: "For growing organizations that need advanced controls and collaboration.",
    monthlyPrice: 2999,
    limits: {
      users: "50",
      storage: "100 GB",
      knowledge_bases: "20",
      usage_credits: "10,000 / month",
    },
  },
  {
    name: "Enterprise",
    description: "For organizations requiring maximum control, security and scale.",
    monthlyPrice: 7999,
    limits: {
      users: "250",
      storage: "500 GB",
      knowledge_bases: "100",
      usage_credits: "50,000 / month",
    },
  },
] as const;

const YEARLY_DISCOUNT = 20;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("razorpay-checkout-script") as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay Checkout.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
    document.body.appendChild(script);
  });
}

function formatMoney(amountInPaise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";
}

function formatResource(resource: string) {
  return resource.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function yearlyMonthlyPrice(price: number) {
  return Math.round(price * (1 - YEARLY_DISCOUNT / 100));
}

const RESOURCE_ICONS: Record<string, any> = {
  documents: FileText,
  knowledge_bases: Database,
  team_members: Users,
  ai_queries_month: Bot,
  storage_mb: HardDrive,
};

export default function BillingPage() {
  const user = useAuthStore((state) => state.user);

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [invoiceFrom, setInvoiceFrom] = useState("");
  const [invoiceTo, setInvoiceTo] = useState("");

  const refresh = async (from = invoiceFrom, to = invoiceTo, sync = false) => {
    setLoading(true);

    try {
      if (sync) {
        await apiRequest({
          path: "/api/billing/sync",
          method: "POST",
        }).catch(() => undefined);
      }

      const [planResponse, billingResponse] = await Promise.all([
        apiRequest<{ data: { plans: Plan[] } }>({ path: "/api/billing/plans" }),
        apiRequest<{ data: Billing }>({
          path: "/api/billing" + (from || to
            ? "?" + new URLSearchParams({
                ...(from ? { from } : {}),
                ...(to ? { to } : {}),
              }).toString()
            : ""),
        }),
      ]);

      setPlans(planResponse.data.plans);
      setBilling(billingResponse.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load billing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh(invoiceFrom, invoiceTo, true);
  }, []);

  const checkout = async (planId: string) => {
    setBusy(planId);
    setError("");
    setMessage("");

    try {
      await loadRazorpay();

      const created = await apiRequest<{
        data: {
          subscriptionId: string;
          razorpaySubscriptionId: string;
          razorpayKeyId: string;
          plan: Plan;
        };
      }>({
        path: "/api/billing/checkout",
        method: "POST",
        body: {
          planId,
          idempotencyKey: crypto.randomUUID(),
        },
      });

      const checkoutInstance = new window.Razorpay({
        key: created.data.razorpayKeyId,
        subscription_id: created.data.razorpaySubscriptionId,
        name: "Enterprise Knowledge Platform",
        description: created.data.plan.name,
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
        },
        handler: async (response: any) => {
          try {
            const verified = await apiRequest<{
              data: {
                verified: boolean;
                status: string;
                subscriptionId: string;
                planId: string;
              };
            }>({
              path: "/api/billing/verify",
              method: "POST",
              body: {
                subscriptionId: created.data.subscriptionId,
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });

            setMessage(
              verified.data.status === "ACTIVE" || verified.data.status === "AUTHENTICATED"
                ? "Payment verified. Your plan has been updated."
                : "Payment verified. Your plan is being activated.",
            );
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Payment verification failed.");
          } finally {
            setBusy(null);
            await refresh();
          }
        },
        modal: {
          ondismiss: () => setBusy(null),
        },
      });

      checkoutInstance.on("payment.failed", (response: any) => {
        setError(response?.error?.description ?? "Payment failed.");
        setBusy(null);
      });

      checkoutInstance.open();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout failed.");
      setBusy(null);
    }
  };

  const upgrade = async (planId: string) => {
    setBusy("upgrade:" + planId);
    setError("");
    setMessage("");

    try {
      await apiRequest({
        path: "/api/billing/upgrade",
        method: "POST",
        body: { planId },
      });

      setMessage("Your subscription upgrade has been applied.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to upgrade subscription.");
    } finally {
      setBusy(null);
    }
  };

  const cancel = async () => {
    setBusy("cancel");
    setError("");
    setMessage("");

    try {
      await apiRequest({
        path: "/api/billing/cancel",
        method: "POST",
        body: { cancelAtPeriodEnd: true },
      });

      setMessage("Cancellation is scheduled for the end of the current billing period.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to cancel subscription.");
    } finally {
      setBusy(null);
    }
  };

  const sortedPlans = useMemo(
    () =>
      [...plans].sort(
        (a, b) =>
          ["Starter", "Business", "Enterprise"].indexOf(a.name) -
          ["Starter", "Business", "Enterprise"].indexOf(b.name),
      ),
    [plans],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your billing workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
                onClick={() => setBillingCycle(cycle)}
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

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          {message}
        </div>
      )}

      {billing && (
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
                  String(billing.usage.team_members ?? 0) +
                  " / " +
                  (billing.plan.limits.team_members === null ? "∞" : String(billing.plan.limits.team_members ?? "—")),
                detail: "Active team member usage",
                icon: Users,
              },
              {
                label: "Storage",
                value: (billing.usage.storage_mb ?? 0).toLocaleString("en-IN") + " MB",
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
                    onClick={() => void cancel()}
                    disabled={Boolean(busy)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {busy === "cancel" && <Loader2 className="h-4 w-4 animate-spin" />}
                    Schedule cancellation
                  </button>
                )}
              </div>
            </section>
          )}

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Usage & entitlements</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Consumption overview</h2>
            <p className="mt-1 text-sm text-slate-500">Monitor the units that drive your current plan limits.</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {Object.entries(billing.plan.limits).map(([resource, limit]) => {
                const used = billing.usage[resource] ?? 0;
                const percent = limit === null || !limit ? 0 : Math.min(100, Math.round((used / Number(limit)) * 100));
                const Icon = RESOURCE_ICONS[resource] ?? Sparkles;

                return (
                  <div key={resource} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">{percent}%</span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-600">{formatResource(resource)}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {used.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-medium text-slate-400">
                        / {limit === null ? "Unlimited" : Number(limit).toLocaleString("en-IN")}
                      </span>
                    </p>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-slate-950 transition-all" style={{ width: percent + "%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

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
                      void checkout(backendPlan.id);
                    } else if (isUpgrade) {
                      void upgrade(backendPlan.id);
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

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Invoices & payment history</h2>
                <p className="text-sm text-slate-500">Filter, review, and download invoices for any billing period.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                From
                <input
                  type="date"
                  value={invoiceFrom}
                  max={invoiceTo || undefined}
                  onChange={(event) => setInvoiceFrom(event.target.value)}
                  className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-slate-400"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                To
                <input
                  type="date"
                  value={invoiceTo}
                  min={invoiceFrom || undefined}
                  onChange={(event) => setInvoiceTo(event.target.value)}
                  className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-slate-400"
                />
              </label>
              <button
                type="button"
                onClick={() => void refresh()}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setInvoiceFrom("");
                  setInvoiceTo("");
                  void refresh("", "");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {billing?.payments?.length ? (
          <>
            <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Invoices</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{billing.payments.length.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Captured amount</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {formatMoney(
                    billing.payments.filter((payment) => payment.status === "CAPTURED").reduce((total, payment) => total + payment.amount, 0),
                    billing.payments[0]?.currency ?? "INR",
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Refunded amount</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {formatMoney(
                    billing.payments.reduce((total, payment) => total + payment.refundedAmount, 0),
                    billing.payments[0]?.currency ?? "INR",
                  )}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Invoice</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Method</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Amount</th>
                    <th className="px-6 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {billing.payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{payment.invoiceId ?? payment.paymentId}</div>
                        <div className="mt-0.5 text-xs text-slate-400">{payment.invoiceId ? "Razorpay invoice" : "Payment receipt"}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(payment.capturedAt ?? payment.createdAt)}</td>
                      <td className="px-6 py-4 capitalize text-slate-600">{payment.method ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span className={[
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          payment.status === "CAPTURED"
                            ? "bg-emerald-50 text-emerald-700"
                            : payment.status === "FAILED"
                              ? "bg-red-50 text-red-700"
                              : "bg-slate-100 text-slate-600",
                        ].join(" ")}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatMoney(payment.amount, payment.currency)}</td>
                      <td className="px-6 py-4 text-right">
                        {payment.invoiceId ? (
                          <a
                            href={"/api/billing/invoice?invoiceId=" + encodeURIComponent(payment.invoiceId)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="px-6 py-14 text-center">
            <ReceiptText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-600">No invoices in this period</p>
            <p className="mt-1 text-sm text-slate-400">Try widening the From / To range or complete a payment.</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Billing notes</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Yearly billing applies the same 20% discount defined on the Payment page.
              Subscription state and entitlement enforcement remain server-controlled.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
