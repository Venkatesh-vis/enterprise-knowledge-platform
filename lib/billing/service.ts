import "server-only";

import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import sequelize from "@/lib/database";
import { requirePermission } from "@/lib/auth/authorization";
import { BillingPlan, Subscription, BillingPayment, BillingIdempotencyKey, BillingWebhookEvent, BillingUsageCounter, BillingAuditEvent } from "@/db/models";
import { BILLING_FEATURES, type BillingFeature, type BillingResource } from "./constants";
import { BillingServiceError } from "./errors";
import { RazorpayService } from "./razorpay";

const ACTIVE_STATUSES = ["AUTHENTICATED", "ACTIVE"];
const SUBSCRIPTION_STATUS_RANK: Record<string, number> = { CREATED: 10, AUTHENTICATED: 20, PENDING: 30, HALTED: 35, ACTIVE: 40, CANCELLED: 50, COMPLETED: 60 };

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

async function getEntitlementForOrganization(organizationId: string, transaction?: any) {
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

async function getIdempotencyRecord(auth: any, key: string, operation: string) {
  const clean = key.trim();
  if (!/^[A-Za-z0-9._:-]{8,191}$/.test(clean)) throw new BillingServiceError("INVALID_IDEMPOTENCY_KEY", "Invalid idempotency key.", 400);
  return { clean, row: await BillingIdempotencyKey.findOne({ where: { organizationId: auth.organization.id, operation, idempotencyKey: clean }, raw: true }) };
}

async function recordBillingAudit(organizationId: string, actorUserId: string | null, eventType: string, resourceId: string | null, metadata: unknown) {
  await BillingAuditEvent.create({ id: randomUUID(), organizationId, actorUserId, eventType, resourceId, metadata, createdAt: new Date() });
}

export async function listPlans() {
  const rows = await BillingPlan.findAll({ where: { active: true }, order: [["price", "ASC"], ["billingInterval", "ASC"]], raw: true });
  return rows.map(serializePlan);
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

export async function createSubscription(planId: string, idempotencyKey: string) {
  const auth = await requirePermission("BILLING_MANAGE");
  const { clean, row: existing } = await getIdempotencyRecord(auth, idempotencyKey, "CREATE_SUBSCRIPTION");
  if (existing) {
    const response: any = existing.response;
    if (response?.state === "CREATING") throw new BillingServiceError("CHECKOUT_IN_PROGRESS", "A checkout is already being created. Please wait and retry.", 409);
    return response;
  }

  const plan = await BillingPlan.findOne({ where: { id: planId, active: true }, raw: true });
  if (!plan) throw new BillingServiceError("BILLING_PLAN_NOT_FOUND", "Billing plan not found.", 404);
  if (Number(plan.price) <= 0) throw new BillingServiceError("BILLING_PLAN_INACTIVE", "The selected plan does not require checkout.", 400);

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

export async function upgradeSubscription(planId: string) {
  const auth = await requirePermission("BILLING_MANAGE");
  const targetPlan = await BillingPlan.findOne({ where: { id: planId, active: true }, raw: true });
  if (!targetPlan) throw new BillingServiceError("BILLING_PLAN_NOT_FOUND", "Billing plan not found.", 404);
  if (Number(targetPlan.price) <= 0) throw new BillingServiceError("BILLING_PLAN_INACTIVE", "The selected plan does not require checkout.", 400);

  const subscription = await findCurrentSubscription(auth.organization.id);
  if (!subscription || !isSubscriptionEntitled(subscription)) {
    throw new BillingServiceError("SUBSCRIPTION_NOT_ACTIVE", "There is no active paid subscription to upgrade.", 409);
  }

  const currentPlan = await BillingPlan.findOne({ where: { id: subscription.planId }, raw: true });
  if (!currentPlan) throw new BillingServiceError("BILLING_CONFIGURATION_ERROR", "Current billing plan is not configured.", 500);
  if (String(currentPlan.id) === String(targetPlan.id)) {
    return { upgraded: false, alreadyCurrent: true, subscriptionId: String(subscription.id), razorpaySubscriptionId: String(subscription.razorpaySubscriptionId), plan: serializePlan(currentPlan) };
  }
  if (Number(targetPlan.price) <= Number(currentPlan.price)) {
    throw new BillingServiceError("PLAN_UPGRADE_REQUIRED", "Only higher-priced plans can be selected here.", 400);
  }

  const razorpay = await RazorpayService.updateSubscription(String(subscription.razorpaySubscriptionId), {
    plan_id: String(targetPlan.razorpayPlanId),
    schedule_change_at: "now",
    customer_notify: true,
  });

  await subscription.update({
    planId: targetPlan.id,
    currentPeriodStart: dateFromUnix(razorpay.current_start) ?? subscription.currentPeriodStart,
    currentPeriodEnd: dateFromUnix(razorpay.current_end) ?? subscription.currentPeriodEnd,
    cancelAtPeriodEnd: false,
  });

  await recordBillingAudit(auth.organization.id, auth.user.id, "SUBSCRIPTION_UPGRADED", String(subscription.id), {
    fromPlanId: String(currentPlan.id),
    toPlanId: String(targetPlan.id),
    razorpaySubscriptionId: String(subscription.razorpaySubscriptionId),
  });

  return {
    upgraded: true,
    subscriptionId: String(subscription.id),
    razorpaySubscriptionId: String(subscription.razorpaySubscriptionId),
    plan: serializePlan(targetPlan),
  };
}
export async function verifySubscriptionPayment(input: { subscriptionId: string; razorpaySubscriptionId: string; razorpayPaymentId: string; razorpaySignature: string }) {
  const auth = await requirePermission("BILLING_MANAGE");
  const subscription = await Subscription.findOne({ where: { id: input.subscriptionId, organizationId: auth.organization.id } });
  if (!subscription || subscription.razorpaySubscriptionId !== input.razorpaySubscriptionId) throw new BillingServiceError("PAYMENT_VERIFICATION_FAILED", "Subscription verification failed.", 400);
  RazorpayService.verifySubscriptionPayment(input.razorpayPaymentId, subscription.razorpaySubscriptionId, input.razorpaySignature);
  await recordBillingAudit(auth.organization.id, auth.user.id, "PAYMENT_SIGNATURE_VERIFIED", subscription.id, { razorpayPaymentId: input.razorpayPaymentId });
  return { verified: true };
}

function mapSubscriptionStatus(status: string) {
  switch (status.toLowerCase()) {
    case "authenticated": return "AUTHENTICATED";
    case "active": return "ACTIVE";
    case "pending": return "PENDING";
    case "halted": return "HALTED";
    case "cancelled": return "CANCELLED";
    case "completed": return "COMPLETED";
    default: return "CREATED";
  }
}

function dateFromUnix(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? new Date(number * 1000) : null;
}

async function processWebhookPayload(payload: any) {
  const eventType = String(payload.event ?? "");
  const subscriptionEntity = payload.payload?.subscription?.entity;
  const paymentEntity = payload.payload?.payment?.entity;

  if (subscriptionEntity?.id) {
    const row = await Subscription.findOne({ where: { razorpaySubscriptionId: String(subscriptionEntity.id) } });
    if (row) {
      const next = mapSubscriptionStatus(String(subscriptionEntity.status ?? ""));
      const current = String(row.status);
      const eventTime = dateFromUnix(payload.created_at)?.getTime() ?? 0;
      const updatedTime = row.updatedAt ? new Date(row.updatedAt).getTime() : 0;
      const isOlderState = eventTime > 0 && updatedTime > eventTime && (SUBSCRIPTION_STATUS_RANK[current] ?? 0) > (SUBSCRIPTION_STATUS_RANK[next] ?? 0);
      if (!isOlderState) {
        let nextPlanId = row.planId;
        if (subscriptionEntity.plan_id) {
          const webhookPlan = await BillingPlan.findOne({ where: { razorpayPlanId: String(subscriptionEntity.plan_id), active: true }, raw: true });
          if (webhookPlan) nextPlanId = webhookPlan.id;
        }
        await row.update({ planId: nextPlanId, status: next, razorpayCustomerId: subscriptionEntity.customer_id ?? row.razorpayCustomerId, currentPeriodStart: dateFromUnix(subscriptionEntity.current_start) ?? row.currentPeriodStart, currentPeriodEnd: dateFromUnix(subscriptionEntity.current_end) ?? row.currentPeriodEnd, cancelledAt: dateFromUnix(subscriptionEntity.ended_at) ?? row.cancelledAt });
        await recordBillingAudit(String(row.organizationId), null, `WEBHOOK_${eventType.toUpperCase().replaceAll(".", "_")}`, String(row.id), { razorpaySubscriptionId: subscriptionEntity.id, status: next });
      }
    }
  }

  if (paymentEntity?.id) {
    const paymentId = String(paymentEntity.id);
    const subscriptionId = paymentEntity.subscription_id ? String(paymentEntity.subscription_id) : null;
    const subscription = subscriptionId ? await Subscription.findOne({ where: { razorpaySubscriptionId: subscriptionId } }) : null;
    const organizationId = subscription?.organizationId ?? paymentEntity.notes?.organizationId;
    const userId = paymentEntity.notes?.userId;
    if (organizationId && userId) {
      const status = String(paymentEntity.status ?? "").toLowerCase() === "captured" ? "CAPTURED" : String(paymentEntity.status ?? "").toLowerCase() === "authorized" ? "AUTHORIZED" : "FAILED";
      await BillingPayment.upsert({ id: randomUUID(), organizationId, subscriptionId: subscription?.id ?? null, userId, razorpayPaymentId: paymentId, razorpayOrderId: paymentEntity.order_id ?? null, razorpayInvoiceId: paymentEntity.invoice_id ?? null, amount: Number(paymentEntity.amount ?? 0), currency: String(paymentEntity.currency ?? "INR"), status, method: paymentEntity.method ?? null, capturedAt: status === "CAPTURED" ? new Date() : null, failureCode: paymentEntity.error_code ?? null, failureReason: paymentEntity.error_description ?? null, metadata: { eventType } });
      await recordBillingAudit(String(organizationId), String(userId), `PAYMENT_${status}`, paymentId, { razorpayPaymentId: paymentId });
    }
  }

  if (eventType.startsWith("refund.")) {
    const refund = payload.payload?.refund?.entity;
    const paymentId = refund?.payment_id;
    if (paymentId) {
      const payment = await BillingPayment.findOne({ where: { razorpayPaymentId: String(paymentId) } });
      if (payment) await payment.update({ status: eventType === "refund.processed" ? (Number(refund.amount) >= Number(payment.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED") : payment.status, refundedAmount: Number(refund.amount ?? payment.refundedAmount) });
    }
  }
}

export async function receiveWebhook(rawBody: string, signature: string) {
  RazorpayService.verifyWebhookSignature(rawBody, signature);
  let payload: any;
  try { payload = JSON.parse(rawBody); } catch { throw new BillingServiceError("WEBHOOK_INVALID", "Webhook payload is invalid.", 400); }
  const eventId = String(payload.id ?? "");
  const eventType = String(payload.event ?? "");
  if (!eventId || !eventType) throw new BillingServiceError("WEBHOOK_INVALID", "Webhook payload is invalid.", 400);

  try {
    const row = await BillingWebhookEvent.create({ id: randomUUID(), eventId, eventType, payload, signature, processingStatus: "RECEIVED" });
    try {
      await processWebhookPayload(payload);
      await row.update({ processingStatus: "PROCESSED", processedAt: new Date(), failureReason: null });
      return { processed: true, duplicate: false };
    } catch (error) {
      await row.update({ processingStatus: "FAILED", failureReason: error instanceof Error ? error.message : "Processing failed", retryCount: Number(row.retryCount) + 1 });
      throw error;
    }
  } catch (error: any) {
    if (error?.name !== "SequelizeUniqueConstraintError") throw error;
    const existing = await BillingWebhookEvent.findOne({ where: { eventId } });
    if (existing?.processingStatus === "PROCESSED") return { processed: true, duplicate: true };
    if (existing) {
      await processWebhookPayload(payload);
      await existing.update({ processingStatus: "PROCESSED", processedAt: new Date(), failureReason: null, retryCount: Number(existing.retryCount) + 1 });
      return { processed: true, duplicate: true };
    }
    throw error;
  }
}

function resourceFeature(resource: BillingResource): BillingFeature {
  const map: Record<BillingResource, BillingFeature> = { documents: BILLING_FEATURES.DOCUMENT_UPLOAD, knowledge_bases: BILLING_FEATURES.KNOWLEDGE_BASE, team_members: BILLING_FEATURES.TEAM_MEMBERS, ai_queries_month: BILLING_FEATURES.AI_ASSISTANT, storage_mb: BILLING_FEATURES.DOCUMENT_UPLOAD };
  return map[resource];
}

async function checkAndConsumeUsage(organizationId: string, resource: BillingResource, amount: number, transaction: any) {
  const entitlement = await getEntitlementForOrganization(organizationId, transaction);
  if (!entitlement.plan.features.includes(resourceFeature(resource))) throw new BillingServiceError("FEATURE_NOT_AVAILABLE", "This feature is not available on your current plan.", 403);
  const limit = entitlement.plan.limits?.[resource] ?? null;
  const periodKey = resource === "ai_queries_month" ? new Date().toISOString().slice(0, 7) : "lifetime";
  let counter = await BillingUsageCounter.findOne({ where: { organizationId, resource, periodKey }, transaction, lock: transaction.LOCK.UPDATE });
  if (!counter) {
    counter = await BillingUsageCounter.create({ id: randomUUID(), organizationId, resource, periodKey, used: 0 }, { transaction });
    counter = await BillingUsageCounter.findOne({ where: { id: counter.id }, transaction, lock: transaction.LOCK.UPDATE });
  }
  const used = Number(counter?.used ?? 0);
  if (limit !== null && used + amount > Number(limit)) throw new BillingServiceError("PLAN_LIMIT_REACHED", `You have reached the ${resource} limit for your current plan.`, 403, { limit: Number(limit), used });
  await counter!.increment("used", { by: amount, transaction });
  return { used: used + amount, limit: limit === null ? null : Number(limit) };
}

export async function requireFeature(feature: BillingFeature) {
  const auth = await requirePermission("DASHBOARD_VIEW");
  const entitlement = await getEntitlementForOrganization(auth.organization.id);
  if (!entitlement.plan.features.includes(feature)) throw new BillingServiceError("FEATURE_NOT_AVAILABLE", "This feature requires an eligible paid plan.", 403);
  return { auth, entitlement };
}

export async function consumeUsage(resource: BillingResource, amount = 1) {
  const auth = await requirePermission("DASHBOARD_VIEW");
  if (!Number.isInteger(amount) || amount < 1) throw new BillingServiceError("INVALID_USAGE_AMOUNT", "Usage amount must be a positive integer.", 400);
  return sequelize.transaction((transaction) => checkAndConsumeUsage(auth.organization.id, resource, amount, transaction));
}

export async function cancelCurrentSubscription(cancelAtPeriodEnd = true) {
  const auth = await requirePermission("BILLING_MANAGE");
  const sub = await Subscription.findOne({ where: { organizationId: auth.organization.id }, order: [["createdAt", "DESC"]] });
  if (!sub) throw new BillingServiceError("SUBSCRIPTION_NOT_FOUND", "No subscription exists.", 404);
  if (["CANCELLED", "COMPLETED"].includes(String(sub.status))) return { cancelled: true, status: sub.status, cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd) };
  await RazorpayService.cancelSubscription(String(sub.razorpaySubscriptionId), cancelAtPeriodEnd);
  await sub.update({ cancelAtPeriodEnd, cancelledAt: cancelAtPeriodEnd ? null : new Date() });
  await recordBillingAudit(auth.organization.id, auth.user.id, "SUBSCRIPTION_CANCEL_REQUESTED", sub.id, { cancelAtPeriodEnd });
  return { cancelled: true, status: sub.status, cancelAtPeriodEnd: sub.cancelAtPeriodEnd };
}

export async function getBillingPayments(filters: { from?: string; to?: string } = {}) {
  const auth = await requirePermission("BILLING_READ");
  const where: any = { organizationId: auth.organization.id };
  const from = filters.from?.trim();
  const to = filters.to?.trim();

  if ((from && !/^\\d{4}-\\d{2}-\\d{2}$/.test(from)) || (to && !/^\\d{4}-\\d{2}-\\d{2}$/.test(to))) {
    throw new BillingServiceError("INVALID_BILLING_DATE_RANGE", "Billing dates must use YYYY-MM-DD format.", 400);
  }
  if (from && to && from > to) throw new BillingServiceError("INVALID_BILLING_DATE_RANGE", "The From date must be on or before the To date.", 400);

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = new Date(`${from}T00:00:00.000Z`);
    if (to) {
      const exclusiveTo = new Date(`${to}T00:00:00.000Z`);
      exclusiveTo.setUTCDate(exclusiveTo.getUTCDate() + 1);
      where.createdAt[Op.lt] = exclusiveTo;
    }
  }

  const rows = await BillingPayment.findAll({ where, order: [["createdAt", "DESC"]], limit: 1000, raw: true });
  return rows.map((row: any) => ({
    id: String(row.id),
    paymentId: String(row.razorpayPaymentId),
    invoiceId: row.razorpayInvoiceId ? String(row.razorpayInvoiceId) : null,
    orderId: row.razorpayOrderId ? String(row.razorpayOrderId) : null,
    amount: Number(row.amount),
    currency: String(row.currency),
    status: String(row.status),
    method: row.method,
    capturedAt: row.capturedAt,
    createdAt: row.createdAt,
    refundedAmount: Number(row.refundedAmount ?? 0),
  }));
}

export async function getInvoiceDownloadUrl(invoiceId: string) {
  const auth = await requirePermission("BILLING_READ");
  const cleanId = invoiceId.trim();
  if (!/^inv_[A-Za-z0-9]+$/.test(cleanId)) throw new BillingServiceError("INVOICE_NOT_FOUND", "Invoice not found.", 404);

  const payment = await BillingPayment.findOne({
    where: { organizationId: auth.organization.id, razorpayInvoiceId: cleanId },
    attributes: ["id"],
    raw: true,
  });
  if (!payment) throw new BillingServiceError("INVOICE_NOT_FOUND", "Invoice not found.", 404);

  const invoice = await RazorpayService.fetchInvoice(cleanId);
  const shortUrl = typeof invoice.short_url === "string" ? invoice.short_url : "";
  if (!shortUrl) throw new BillingServiceError("INVOICE_NOT_AVAILABLE", "This invoice is not available for download yet.", 404);
  return shortUrl;
}

export { BILLING_FEATURES };
