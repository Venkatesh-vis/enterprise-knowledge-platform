import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay credentials are not configured.");
  return { keyId, keySecret };
}

function authHeader() {
  const { keyId, keySecret } = getCredentials();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${RAZORPAY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await response.text();
  let data: unknown = null;
  try { data = body ? JSON.parse(body) : null; } catch { data = body; }
  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data
      ? String((data as { error?: { description?: string } }).error?.description ?? "Razorpay request failed.")
      : "Razorpay request failed.";
    throw new Error(message);
  }
  return data as T;
}

export type RazorpaySubscription = {
  id: string;
  plan_id: string;
  status: string;
  current_start?: number | null;
  current_end?: number | null;
  charge_at?: number | null;
  short_url?: string | null;
};

export type RazorpayInvoice = {
  id: string;
  invoice_number?: string | null;
  status: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  short_url?: string | null;
  payment_id?: string | null;
  issued_at?: number | null;
  paid_at?: number | null;
  customer_details?: { name?: string | null; email?: string | null; contact?: string | null } | null;
};

export async function createRazorpaySubscription(input: { planId: string; totalCount: number; notes: Record<string, string> }) {
  return razorpayRequest<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ plan_id: input.planId, total_count: input.totalCount, quantity: 1, customer_notify: true, notes: input.notes }),
  });
}

export async function fetchRazorpaySubscription(subscriptionId: string) {
  return razorpayRequest<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export async function fetchRazorpayInvoice(invoiceId: string) {
  return razorpayRequest<RazorpayInvoice>(`/invoices/${encodeURIComponent(invoiceId)}`);
}

export function verifySubscriptionSignature(input: { subscriptionId: string; paymentId: string; signature: string }) {
  const { keySecret } = getCredentials();
  const expected = createHmac("sha256", keySecret).update(`${input.subscriptionId}|${input.paymentId}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(input.signature, "utf8");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function verifyWebhookSignature(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("Razorpay webhook secret is not configured.");
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function getRazorpayKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) throw new Error("Razorpay key ID is not configured.");
  return keyId;
}
