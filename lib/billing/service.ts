import "server-only";

import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import sequelize from "@/lib/database";
import { requirePermission } from "@/lib/auth/authorization";
import { BillingPlan, Subscription, BillingPayment, BillingIdempotencyKey, BillingWebhookEvent, BillingUsageCounter, BillingAuditEvent } from "@/db/models";
import { createRedisKey, getRedisJson, setRedisJson } from "@/lib/cache/redis";
import { BILLING_FEATURES, type BillingFeature, type BillingResource } from "./constants";
import { BillingServiceError } from "./errors";
import { RazorpayService } from "./razorpay";

const ACTIVE_STATUSES = ["AUTHENTICATED", "ACTIVE"];
const SUBSCRIPTION_STATUS_RANK: Record<string, number> = { CREATED: 10, AUTHENTICATED: 20, PENDING: 30, HALTED: 35, ACTIVE: 40, CANCELLED: 50, COMPLETED: 60 };
const BILLING_PLANS_CACHE_TTL_SECONDS = 300;

function serializePlan(row: any) {
  return {
    id: String(row.id), name: String(row.name), description: row.description ? String(row.description) : null,
    interval: String(row.billingInterval), price: Number(row.price), currency: String(row.currency),
    features: Array.isArray(row.features) ? row.features : [], limits: row.limits ?? {}, active: Boolean(row.active),
  };
}

function isSubscriptionEntitled(row: any) {
  return Boolean(row && ACTIVE_STATUSES.includes(String(row.status)) && (!row.currentPeriodEnd || new Date(row.currentPeriodEnd).getTime() > Date.now()));
}

async function findCurrentSubscription(organizationId: string, transaction?: any) {
  return Subscription.findOne({ where: { organizationId }, include: [{ model: BillingPlan, as: "plan" }], order: [["createdAt", "DESC"]], transaction });
}

export async function getEntitlementForOrganization(organizationId: string, transaction?: any) {
  const subscription = await findCurrentSubscription(organizationId, transaction);
  const freePlan = await BillingPlan.findOne({ where: { name: "Free", active: true }, transaction });
  if (!freePlan) throw new BillingServiceError("BILLING_CONFIGURATION_ERROR", "Free plan is not configured.", 500);
  const entitled = isSubscriptionEntitled(subscription);
  const plan = entitled && subscription?.plan ? subscription.plan : freePlan;
  return {
    plan: serializePlan(plan),
    subscriptionStatus: subscription?.status ?? "FREE",
    subscriptionId: subscription?.id ?? null,
    razorpaySubscriptionId: subscription?.razorpaySubscriptionId ?? null,
    currentPeriodStart: subscription?.currentPeriodStart ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: Boolean(subscription?.cancelAtPeriodEnd),
    isExpired: Boolean(subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd).getTime() <= Date.now()),
  };
}

async function ensureRazorpayPlan(plan: any) {
  const currentId = String(plan.razorpayPlanId ?? "").trim();
  if (currentId && !currentId.startsWith("CONFIGURE_")) return { ...plan, razorpayPlanId: currentId };

  const created = await RazorpayService.createPlan({
    period: String(plan.billingInterval).toLowerCase() === "yearly" ? "yearly" : "monthly",
    interval: 1,
    item: {
      name: String(plan.name),
      amount: Number(plan.price),
      currency: String(plan.currency),
      description: plan.description ? String(plan.description) : String(plan.name),
    },
    notes: {
      application: "enterprise-knowledge-platform",
      planId: String(plan.id),
    },
  });

  const razorpayPlanId = String(created.id ?? "");
  if (!/^plan_[A-Za-z0-9]+$/.test(razorpayPlanId)) {
    throw new BillingServiceError("PAYMENT_CREATION_FAILED", "Razorpay did not return a valid plan ID.", 502);
  }

  await BillingPlan.update(
    { razorpayPlanId },
    { where: { id: plan.id } },
  );

  return { ...plan, razorpayPlanId };
}

async function getIdempotencyRecord(auth: any, key: string, operation: string) {
  const clean = key.trim();
  if (!/^[A-Za-z0-9._:-]{8,191}$/.test(clean)) throw new BillingServiceError("INVALID_IDEMPOTENCY_KEY", "Invalid idempotency key.", 400);
  return { clean, row: await BillingIdempotencyKey.findOne({ where: { organizationId: auth.organization.id, operation, idempotencyKey: clean }, raw: true }) };
}

async function recordBillingAudit(organizationId: string, actorUserId: string | null, eventType: string, resourceId: string | null, metadata: unknown) {
  await BillingAuditEvent.create({ id: randomUUID(), organizationId, actorUserId, eventType, resourceId, metadata, createdAt: new Date() });
}

export async function listPlans() {
  const cacheKey = createRedisKey("billing", "plans");
  const cached = await getRedisJson<ReturnType<typeof serializePlan>[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const rows = await BillingPlan.findAll({ where: { active: true }, order: [["price", "ASC"], ["billingInterval", "ASC"]], raw: true });
  const plans = rows.map(serializePlan);
  await setRedisJson(cacheKey, plans, BILLING_PLANS_CACHE_TTL_SECONDS);
  return plans;
}

async function syncSubscriptionInvoices(
  organizationId: string,
  subscriptionId: string,
  razorpaySubscriptionId: string,
  userId: string,
) {
  const invoices: any[] = [];
  let skip = 0;

  while (true) {
    const response = await RazorpayService.fetchSubscriptionInvoices(razorpaySubscriptionId, skip, 100);
    const batch = Array.isArray(response?.items)
      ? response.items
      : Array.isArray(response?.item)
        ? response.item
        : [];

    invoices.push(...batch);

    if (batch.length < 100) break;
    skip += batch.length;
  }

  for (const invoice of invoices) {
    const paymentId = String(invoice.payment_id ?? "").trim();
    const invoiceId = String(invoice.id ?? "").trim();
    if (!paymentId || !invoiceId) continue;

    const existing = await BillingPayment.findOne({
      where: { organizationId, razorpayPaymentId: paymentId },
    });

    const paidAt = dateFromUnix(invoice.paid_at) ?? dateFromUnix(invoice.created_at);
    const status = String(invoice.status ?? "").toLowerCase() === "paid" ? "CAPTURED" : "CREATED";
    const amount = Number(invoice.amount_paid ?? invoice.amount ?? 0);
    const currency = String(invoice.currency ?? "INR");

    if (existing) {
      await existing.update({
        subscriptionId,
        razorpayInvoiceId: invoiceId,
        amount,
        currency,
        status,
        capturedAt: status === "CAPTURED" ? paidAt : null,
        metadata: {
          source: "RAZORPAY_INVOICE_SYNC",
          invoiceStatus: invoice.status ?? null,
        },
      });
      continue;
    }

    let method = null;
    try {
      const payment = await RazorpayService.fetchPayment(paymentId);
      method = payment.method ?? null;
    } catch {
      // Invoice synchronization should not fail because optional payment
      // detail lookup is temporarily unavailable.
    }

    await BillingPayment.create({
      id: randomUUID(),
      organizationId,
      subscriptionId,
      userId,
      razorpayPaymentId: paymentId,
      razorpayOrderId: invoice.order_id ?? null,
      razorpayInvoiceId: invoiceId,
      amount,
      currency,
      status,
      method,
      capturedAt: status === "CAPTURED" ? paidAt : null,
      failureCode: null,
      failureReason: null,
      refundedAmount: 0,
      metadata: {
        source: "RAZORPAY_INVOICE_SYNC",
        invoiceStatus: invoice.status ?? null,
      },
    });
  }

  return invoices.length;
}

async function syncOrganizationInvoices(organizationId: string, userId: string) {
  const subscriptions = await Subscription.findAll({
    where: { organizationId },
    attributes: ["id", "razorpaySubscriptionId"],
    raw: true,
  });

  let invoiceCount = 0;
  for (const subscription of subscriptions as any[]) {
    try {
      invoiceCount += await syncSubscriptionInvoices(
        organizationId,
        String(subscription.id),
        String(subscription.razorpaySubscriptionId),
        userId,
      );
    } catch (error) {
      console.error("Failed to sync subscription invoices:", error);
    }
  }

  return invoiceCount;
}

export async function syncCurrentSubscription() {
  const auth = await requirePermission("BILLING_READ");
  const subscription = await findCurrentSubscription(auth.organization.id);
  if (!subscription) return { synced: false, reason: "NO_SUBSCRIPTION" };

  const remote = await RazorpayService.fetchSubscription(String(subscription.razorpaySubscriptionId));
  const remoteStatus = mapSubscriptionStatus(String(remote.status ?? ""));
  let resolvedPlanId = subscription.planId;

  if (remote.plan_id) {
    const remotePlan = await BillingPlan.findOne({
      where: { razorpayPlanId: String(remote.plan_id), active: true },
      attributes: ["id"],
      raw: true,
    });
    if (remotePlan) resolvedPlanId = remotePlan.id;
  }

  await subscription.update({
    planId: resolvedPlanId,
    status: remoteStatus,
    razorpayCustomerId: remote.customer_id ?? subscription.razorpayCustomerId,
    currentPeriodStart: dateFromUnix(remote.current_start) ?? subscription.currentPeriodStart,
    currentPeriodEnd: dateFromUnix(remote.current_end) ?? subscription.currentPeriodEnd,
    cancelledAt: dateFromUnix(remote.ended_at) ?? subscription.cancelledAt,
  });

  const invoiceCount = await syncOrganizationInvoices(
    auth.organization.id,
    auth.user.id,
  );

  return {
    synced: true,
    subscriptionId: String(subscription.id),
    status: remoteStatus,
    planId: String(resolvedPlanId),
    invoiceCount,
  };
}

export async function getCurrentEntitlement() {
  const auth = await requirePermission("BILLING_READ");
  const entitlement = await getEntitlementForOrganization(auth.organization.id);
  const period = new Date().toISOString().slice(0, 7);
  const rows = await BillingUsageCounter.findAll({ where: { organizationId: auth.organization.id, periodKey: { [Op.in]: ["lifetime", period] } }, attributes: ["resource", "used", "periodKey"], raw: true });
  const usage: Record<string, number> = {};
  for (const row of rows as any[]) usage[String(row.resource)] = Number(row.used);
  return { ...entitlement, usage };
}

async function createSubscription(planId: string, idempotencyKey: string) {
  const auth = await requirePermission("BILLING_MANAGE");
  const { clean, row: existing } = await getIdempotencyRecord(auth, idempotencyKey, "CREATE_SUBSCRIPTION");
  if (existing) {
    const response: any = existing.response;
    if (response?.state === "CREATING") throw new BillingServiceError("CHECKOUT_IN_PROGRESS", "A checkout is already being created. Please wait and retry.", 409);
    return response;
  }

  let plan = await BillingPlan.findOne({ where: { id: planId, active: true }, raw: true });
  if (!plan) throw new BillingServiceError("BILLING_PLAN_NOT_FOUND", "Billing plan not found.", 404);
  if (Number(plan.price) <= 0) throw new BillingServiceError("BILLING_PLAN_INACTIVE", "The selected plan does not require checkout.", 400);
  plan = await ensureRazorpayPlan(plan);

  const active = await findCurrentSubscription(auth.organization.id);
  if (active && isSubscriptionEntitled(active)) throw new BillingServiceError("SUBSCRIPTION_ALREADY_ACTIVE", "An active subscription already exists.", 409);

  const reservation = { state: "CREATING", planId: String(plan.id), createdAt: new Date().toISOString() };
  try {
    await BillingIdempotencyKey.create({ id: randomUUID(), organizationId: auth.organization.id, userId: auth.user.id, operation: "CREATE_SUBSCRIPTION", idempotencyKey: clean, response: reservation });
  } catch (error: any) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      const concurrent = await BillingIdempotencyKey.findOne({ where: { organizationId: auth.organization.id, operation: "CREATE_SUBSCRIPTION", idempotencyKey: clean }, raw: true });
      if (concurrent?.response?.state === "CREATING") throw new BillingServiceError("CHECKOUT_IN_PROGRESS", "A checkout is already being created. Please wait and retry.", 409);
      return concurrent?.response;
    }
    throw error;
  }

  try {
    const razorpay = await RazorpayService.createSubscription({ plan_id: String(plan.razorpayPlanId), total_count: 120, customer_notify: 1, notes: { organizationId: auth.organization.id, planId: String(plan.id), userId: auth.user.id } });
    const internal = await Subscription.create({ id: randomUUID(), organizationId: auth.organization.id, planId: plan.id, razorpaySubscriptionId: razorpay.id, razorpayCustomerId: razorpay.customer_id ?? null, status: "CREATED", metadata: { checkoutUserId: auth.user.id } });
    const result = { state: "CREATED", subscriptionId: internal.id, razorpaySubscriptionId: razorpay.id, razorpayKeyId: process.env.RAZORPAY_KEY_ID, plan: serializePlan(plan) };
    await BillingIdempotencyKey.update({ response: result }, { where: { organizationId: auth.organization.id, operation: "CREATE_SUBSCRIPTION", idempotencyKey: clean } });
    await recordBillingAudit(auth.organization.id, auth.user.id, "SUBSCRIPTION_CREATED", internal.id, { planId: String(plan.id), razorpaySubscriptionId: razorpay.id });
    return result;
  } catch (error) {
    await BillingIdempotencyKey.destroy({ where: { organizationId: auth.organization.id, operation: "CREATE_SUBSCRIPTION", idempotencyKey: clean, response: reservation } }).catch(() => undefined);
    throw error;
  }
}

export { createSubscription };
