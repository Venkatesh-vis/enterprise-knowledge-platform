import "server-only";

import { requireAuth } from "@/lib/auth/authorization";
import { BillingPayment, BillingUsageCounter } from "@/db/models";
import { getCurrentEntitlement, listPlans } from "./service";

export async function getPublicBillingState() {
  const auth = await requireAuth();
  const entitlement = await getCurrentEntitlement().catch(() => null);
  if (entitlement) return entitlement;

  const plans = await listPlans();
  const freePlan = plans.find((plan) => plan.name === "Free");
  const period = new Date().toISOString().slice(0, 7);
  const rows = await BillingUsageCounter.findAll({ where: { organizationId: auth.organization.id, periodKey: period }, attributes: ["resource", "used"], raw: true });
  const usage: Record<string, number> = {};
  for (const row of rows as any[]) usage[String(row.resource)] = Number(row.used);
  return { plan: freePlan, subscriptionStatus: "FREE", subscriptionId: null, razorpaySubscriptionId: null, currentPeriodStart: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, isExpired: false, usage };
}

export async function getPublicBillingPayments() {
  const auth = await requireAuth();
  const rows = await BillingPayment.findAll({ where: { organizationId: auth.organization.id }, order: [["createdAt", "DESC"]], limit: 100, raw: true });
  return rows.map((row: any) => ({ id: String(row.id), paymentId: String(row.razorpayPaymentId), amount: Number(row.amount), currency: String(row.currency), status: String(row.status), method: row.method, capturedAt: row.capturedAt }));
}
