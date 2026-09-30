import "server-only";
import { BillingServiceError } from "./errors";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new BillingServiceError("BILLING_CONFIGURATION_ERROR", `Missing ${name}.`, 500);
  return value;
}

export function getRazorpayConfig() {
  return {
    keyId: required("RAZORPAY_KEY_ID"),
    keySecret: required("RAZORPAY_KEY_SECRET"),
    webhookSecret: required("RAZORPAY_WEBHOOK_SECRET"),
  };
}
