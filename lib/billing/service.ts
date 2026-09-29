import "server-only";

import { randomUUID } from "crypto";
import { Op } from "sequelize";

import {
  BillingInvoice,
  BillingSubscription,
  BillingWebhookEvent,
  Document,
  Organization,
  OrganizationMembership,
} from "@/db/models";
import { requirePermission } from "@/lib/auth/authorization";
import sequelize from "@/lib/database";

import {
  getPlanPrice,
  hasPlanFeature,
  PLAN_DEFINITIONS,
  type BillingCycle,
  type PlanFeature,
  type PlanId,
} from "./plans";
import {
  createRazorpaySubscription,
  fetchRazorpayInvoice,
  fetchRazorpaySubscription,
  getRazorpayKeyId,
  verifySubscriptionSignature,
} from "./razorpay";

export class BillingServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BillingServiceError";
    this.status = status;
  }
}

function getRazorpayPlanId(plan: PlanId, cycle: BillingCycle) {
  const names: Record<PlanId, Record<BillingCycle, string>> = {
    starter: {
      monthly: "RAZORPAY_PLAN_STARTER_MONTHLY",
      yearly: "RAZORPAY_PLAN_STARTER_YEARLY",
    },
    business: {
      monthly: "RAZORPAY_PLAN_BUSINESS_MONTHLY",
      yearly: "RAZORPAY_PLAN_BUSINESS_YEARLY",
    },
    enterprise: {
      monthly: "RAZORPAY_PLAN_ENTERPRISE_MONTHLY",
      yearly: "RAZORPAY_PLAN_ENTERPRISE_YEARLY",
    },
  };

  const envName = names[plan][cycle];
  const value = process.env[envName];

  if (!value) {
    throw new BillingServiceError(`${envName} is not configured.`, 500);
  }

  return value;
}

function dateFromUnix(value?: number | null) {
  return value ? new Date(value * 1000) : null;
}

async function getOrganizationForBilling(organizationId: string) {
  const organization = await Organization.findByPk(organizationId);
  if (!organization) throw new BillingServiceError("Organization not found.", 404);
  return organization;
}

async function getUsage(organizationId: string) {
  const members = await OrganizationMembership.findAll({
    where: { organizationId },
    attributes: ["userId"],
    raw: true,
  });
  const userIds = members.map((member: { userId: string }) => member.userId);

  if (!userIds.length) {
    return { users: 0, documents: 0, storageBytes: 0 };
  }

  const documents = await Document.findAll({
    where: { uploadedBy: { [Op.in]: userIds } },
    attributes: ["sizeBytes"],
    raw: true,
  });

  return {
    users: userIds.length,
    documents: documents.length,
    storageBytes: documents.reduce(
      (total: number, document: { sizeBytes: string | number }) =>
        total + Number(document.sizeBytes || 0),
      0,
    ),
  };
}

async function assertPlanCanBeApplied(
  organizationId: string,
  plan: PlanId,
) {
  const definition = PLAN_DEFINITIONS[plan];
  const usage = await getUsage(organizationId);

  if (usage.users > definition.limits.users) {
    throw new BillingServiceError(
      `The organization currently has ${usage.users} users, but ${definition.name} allows ${definition.limits.users}.`,
      409,
    );
  }

  if (usage.storageBytes > definition.limits.storageBytes) {
    throw new BillingServiceError(
      `Current document storage exceeds the ${definition.name} limit. Remove documents before moving to this plan.`,
      409,
    );
  }
}

export async function requirePlanFeature(
  feature: PlanFeature,
  permission?: "AI_USE" | "ANALYTICS_READ" | "AUDIT_LOG_READ",
) {
  const auth = permission
    ? await requirePermission(permission)
    : await requirePermission("DASHBOARD_VIEW");

  const plan = String(auth.organization.planKey) as PlanId;
  if (!hasPlanFeature(plan, feature)) {
    throw new BillingServiceError(
      `The ${feature.replaceAll("_", " ").toLowerCase()} feature is not available on the ${plan} plan.`,
      403,
    );
  }

  return auth;
}

export async function getBillingPageData() {
  const auth = await requirePermission("BILLING_READ");
  const organization = await getOrganizationForBilling(auth.organization.id);
  const usage = await getUsage(organization.id);
  const invoices = await BillingInvoice.findAll({
    where: { organizationId: organization.id },
    order: [["createdAt", "DESC"]],
    limit: 25,
    raw: true,
  });

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      planKey: organization.planKey,
      billingCycle: organization.billingCycle,
      subscriptionStatus: organization.subscriptionStatus,
      currentPeriodStart: organization.currentPeriodStart,
      currentPeriodEnd: organization.currentPeriodEnd,
    },
    usage,
    plan: PLAN_DEFINITIONS[organization.planKey as PlanId],
    invoices,
    razorpayKeyId: getRazorpayKeyId(),
  };
}

export async function createSubscription(input: {
  plan: PlanId;
  billingCycle: BillingCycle;
}) {
  const auth = await requirePermission("BILLING_MANAGE");
  const organization = await getOrganizationForBilling(auth.organization.id);

  if (organization.planKey === input.plan && organization.billingCycle === input.billingCycle && organization.subscriptionStatus === "ACTIVE") {
    throw new BillingServiceError("This plan is already active.", 409);
  }

  await assertPlanCanBeApplied(organization.id, input.plan);

  const active = await BillingSubscription.findOne({
    where: {
      organizationId: organization.id,
      status: { [Op.in]: ["CREATED", "ACTIVE", "PENDING"] },
    },
  });

  if (active) {
    throw new BillingServiceError(
      "There is already a billing transaction in progress. Complete or cancel it before starting another checkout.",
      409,
    );
  }

  const plan = PLAN_DEFINITIONS[input.plan];
  const amountPaise = getPlanPrice(input.plan, input.billingCycle);
  const razorpayPlanId = getRazorpayPlanId(input.plan, input.billingCycle);
  const totalCount = input.billingCycle === "monthly" ? 120 : 10;

  const razorpaySubscription = await createRazorpaySubscription({
    planId: razorpayPlanId,
    totalCount,
    notes: {
      organizationId: organization.id,
      planKey: input.plan,
      billingCycle: input.billingCycle,
    },
  });

  await BillingSubscription.create({
    id: randomUUID(),
    organizationId: organization.id,
    planKey: input.plan,
    billingCycle: input.billingCycle,
    status: "PENDING",
    amountPaise,
    currency: "INR",
    razorpayPlanId,
    razorpaySubscriptionId: razorpaySubscription.id,
    metadata: { totalCount },
  });

  return {
    keyId: getRazorpayKeyId(),
    subscriptionId: razorpaySubscription.id,
    planName: plan.name,
    amountPaise,
    currency: "INR",
    customer: {
      name: auth.user.name,
      email: auth.user.email,
    },
  };
}

export async function verifyCheckout(input: {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}) {
  const auth = await requirePermission("BILLING_MANAGE");
  const record = await BillingSubscription.findOne({
    where: {
      organizationId: auth.organization.id,
      razorpaySubscriptionId: input.subscriptionId,
    },
  });

  if (!record) throw new BillingServiceError("Billing transaction not found.", 404);

  if (!verifySubscriptionSignature(input)) {
    throw new BillingServiceError("Payment signature verification failed.", 400);
  }

  const remote = await fetchRazorpaySubscription(input.subscriptionId);
  await activateSubscription(record, remote, input.paymentId);

  return { success: true };
}

async function activateSubscription(
  record: any,
  remote: { status: string; current_start?: number | null; current_end?: number | null },
  paymentId?: string,
) {
  const status = remote.status === "active" || remote.status === "authenticated" ? "ACTIVE" : remote.status.toUpperCase();
  const start = dateFromUnix(remote.current_start) ?? new Date();
  const end = dateFromUnix(remote.current_end);

  await sequelize.transaction(async (transaction) => {
    await record.update(
      {
        status,
        razorpayPaymentId: paymentId ?? record.razorpayPaymentId,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        startedAt: record.startedAt ?? start,
      },
      { transaction },
    );

    if (status === "ACTIVE") {
      await Organization.update(
        {
          planKey: record.planKey,
          billingCycle: record.billingCycle,
          subscriptionStatus: "ACTIVE",
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
        { where: { id: record.organizationId }, transaction },
      );
    }
  });
}

export async function processWebhookEvent(eventId: string, eventType: string, payload: any) {
  const existing = await BillingWebhookEvent.findOne({ where: { razorpayEventId: eventId } });
  if (existing?.status === "PROCESSED") return;

  const event = existing ?? await BillingWebhookEvent.create({
    id: randomUUID(),
    razorpayEventId: eventId,
    eventType,
    status: "PROCESSING",
    payload,
  });

  try {
    const subscriptionEntity = payload?.payload?.subscription?.entity;
    const paymentEntity = payload?.payload?.payment?.entity;
    const subscriptionId = subscriptionEntity?.id ?? paymentEntity?.subscription_id;

    if (subscriptionId) {
      const record = await BillingSubscription.findOne({
        where: { razorpaySubscriptionId: subscriptionId },
      });

      if (record) {
        if (["subscription.activated", "subscription.resumed", "subscription.charged", "payment.authorized"].includes(eventType)) {
          await activateSubscription(record, {
            status: subscriptionEntity?.status ?? "active",
            current_start: subscriptionEntity?.current_start,
            current_end: subscriptionEntity?.current_end,
          }, paymentEntity?.id);
        } else if (["subscription.cancelled", "subscription.halted", "subscription.paused"].includes(eventType)) {
          const nextStatus = eventType === "subscription.paused" ? "PAUSED" : "PAST_DUE";
          await record.update({ status: nextStatus });
          await Organization.update({ subscriptionStatus: nextStatus }, { where: { id: record.organizationId } });
        }

        const invoiceId = paymentEntity?.invoice_id;
        if (invoiceId) {
          await syncInvoice(record, invoiceId);
        }
      }
    }

    await event.update({ status: "PROCESSED", processedAt: new Date(), errorMessage: null });
  } catch (error) {
    await event.update({ status: "FAILED", errorMessage: error instanceof Error ? error.message : "Unknown webhook error" });
    throw error;
  }
}

async function syncInvoice(subscription: any, invoiceId: string) {
  const remote = await fetchRazorpayInvoice(invoiceId);
  const existing = await BillingInvoice.findOne({ where: { razorpayInvoiceId: invoiceId } });
  const organization = await Organization.findByPk(subscription.organizationId, { attributes: ["id", "name"] });
  if (!organization) return;

  const values = {
    organizationId: subscription.organizationId,
    subscriptionId: subscription.id,
    razorpayInvoiceId: remote.id,
    invoiceNumber: remote.invoice_number ?? null,
    status: remote.status,
    amountPaise: remote.amount,
    amountPaidPaise: remote.amount_paid ?? 0,
    currency: remote.currency,
    paymentId: remote.payment_id ?? subscription.razorpayPaymentId ?? null,
    hostedUrl: remote.short_url ?? null,
    issuedAt: dateFromUnix(remote.issued_at),
    paidAt: dateFromUnix(remote.paid_at),
    customerName: remote.customer_details?.name ?? organization.name,
    customerEmail: remote.customer_details?.email ?? "",
    details: {
      planKey: subscription.planKey,
      billingCycle: subscription.billingCycle,
      amountPaise: remote.amount,
      currency: remote.currency,
    },
  };

  if (existing) await existing.update(values);
  else await BillingInvoice.create({ id: randomUUID(), ...values });
}
