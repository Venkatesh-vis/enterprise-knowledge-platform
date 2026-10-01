"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { apiRequest } from "@/app/shared/lib/api";
import { useAuthStore } from "@/app/shared/store/auth-store";
import { useWorkspaceStore } from "@/app/shared/store/workspace-store";

import {
  BillingHeader,
  BillingMessages,
  BillingSummary,
  UsageOverview,
  PricingPlans,
  InvoiceHistory,
  BillingNotes,
} from "./components";
import type { Billing, BillingCycle, Plan } from "./components/billing-types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export default function BillingPage() {
  const user = useAuthStore((state) => state.user);
  const workspace = useWorkspaceStore((state) => state.overview);
  const workspaceLoading = useWorkspaceStore((state) => state.isLoading);

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [invoiceFrom, setInvoiceFrom] = useState("");
  const [invoiceTo, setInvoiceTo] = useState("");

  const refresh = async (from = invoiceFrom, to = invoiceTo) => {
    setLoading(true);

    try {
      const [planResponse, billingResponse] = await Promise.all([
        apiRequest<{ data: { plans: Plan[] } }>({
          path: "/api/billing/plans",
        }),
        apiRequest<{ data: Billing }>({
          path: "/api/billing" + (from || to
            ? "?" +
              new URLSearchParams({
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
    void refresh("", "");
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
            window.dispatchEvent(new Event("billing:updated"));
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
      window.dispatchEvent(new Event("billing:updated"));
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

  if (loading || workspaceLoading) {
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
      <BillingHeader
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
      />

      <BillingMessages error={error} message={message} />

      {billing && (
        <>
          <BillingSummary
            billing={billing}
            workspace={workspace}
            busy={busy}
            onCancel={() => void cancel()}
          />

          <UsageOverview billing={billing} workspace={workspace} />
        </>
      )}

      <PricingPlans
        billing={billing}
        plans={plans}
        billingCycle={billingCycle}
        busy={busy}
        onCheckout={(planId) => void checkout(planId)}
        onUpgrade={(planId) => void upgrade(planId)}
      />

      <InvoiceHistory
        billing={billing}
        invoiceFrom={invoiceFrom}
        invoiceTo={invoiceTo}
        onFromChange={setInvoiceFrom}
        onToChange={setInvoiceTo}
        onApply={() => void refresh()}
        onClear={() => {
          setInvoiceFrom("");
          setInvoiceTo("");
          void refresh("", "");
        }}
      />

      <BillingNotes />
    </div>
  );
}
