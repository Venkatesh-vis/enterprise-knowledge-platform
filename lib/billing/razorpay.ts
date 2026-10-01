import "server-only";
import crypto from "node:crypto";
import { BillingServiceError } from "./errors";
import { getRazorpayConfig } from "./env";

type RazorpayResponse = { id: string; [key: string]: any };
const BASE_URL = "https://api.razorpay.com/v1";

function basicAuth(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function call<T extends RazorpayResponse>(path: string, method: "GET" | "POST" | "PATCH", body?: unknown) {
  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { Authorization: basicAuth(keyId, keySecret), "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!response.ok) {
    throw new BillingServiceError("PAYMENT_CREATION_FAILED", String(data.error?.description ?? "Razorpay request failed."), 502);
  }
  return data as T;
}

function compareSignature(expected: string, actual: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(actual, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const RazorpayService = {
  createPlan: (body: unknown) => call<RazorpayResponse>("/plans", "POST", body),
  createSubscription: (body: unknown) => call<RazorpayResponse>("/subscriptions", "POST", body),
  fetchSubscription: (id: string) => call<RazorpayResponse>(`/subscriptions/${encodeURIComponent(id)}`, "GET"),
  updateSubscription: (id: string, body: unknown) => call<RazorpayResponse>(`/subscriptions/${encodeURIComponent(id)}`, "PATCH", body),
  fetchInvoice: (id: string) => call<RazorpayResponse>(`/invoices/${encodeURIComponent(id)}`, "GET"),
  fetchPayment: (id: string) => call<RazorpayResponse>(`/payments/${encodeURIComponent(id)}`, "GET"),
  cancelSubscription: (id: string, cancelAtCycleEnd: boolean) => call<RazorpayResponse>(`/subscriptions/${encodeURIComponent(id)}/cancel`, "POST", { cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 }),
  refundPayment: (paymentId: string, amount?: number) => call<RazorpayResponse>(`/payments/${encodeURIComponent(paymentId)}/refund`, "POST", amount === undefined ? undefined : { amount }),

  verifySubscriptionPayment(paymentId: string, subscriptionId: string, signature: string) {
    const { keySecret } = getRazorpayConfig();
    const expected = crypto.createHmac("sha256", keySecret).update(`${paymentId}|${subscriptionId}`).digest("hex");
    if (!compareSignature(expected, signature)) throw new BillingServiceError("PAYMENT_VERIFICATION_FAILED", "Payment signature verification failed.", 400);
  },

  verifyWebhookSignature(rawBody: string, signature: string) {
    const { webhookSecret } = getRazorpayConfig();
    const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (!compareSignature(expected, signature)) throw new BillingServiceError("WEBHOOK_SIGNATURE_INVALID", "Webhook signature verification failed.", 400);
  },
};
