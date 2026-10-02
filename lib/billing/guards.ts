import { Op } from "sequelize";
import { BillingUsageCounter, Document, Invitation, KnowledgeBase, OrganizationMembership } from "@/db/models";
import { BILLING_RESOURCES, type BillingFeature, type BillingResource } from "./constants";
import { BillingServiceError } from "./errors";
import { getEntitlementForOrganization } from "./service";

export async function getPlanUsage(organizationId: string, resource: BillingResource, transaction?: any) {
  switch (resource) {
    case BILLING_RESOURCES.DOCUMENTS:
      return Number(await Document.count({ where: { organizationId }, transaction }));
    case BILLING_RESOURCES.KNOWLEDGE_BASES:
      return Number(await KnowledgeBase.count({ where: { organizationId }, transaction }));
    case BILLING_RESOURCES.TEAM_MEMBERS: {
      const [members, pendingInvitations] = await Promise.all([
        OrganizationMembership.count({ where: { organizationId }, transaction }),
        Invitation.count({ where: { organizationId, status: "PENDING" }, transaction }),
      ]);
      return Number(members) + Number(pendingInvitations);
    }
    case BILLING_RESOURCES.STORAGE_MB: {
      const sum = await Document.sum("sizeBytes", { where: { organizationId }, transaction });
      return Math.ceil(Number(sum ?? 0) / 1024 / 1024);
    }
    case BILLING_RESOURCES.AI_QUERIES_MONTH: {
      const periodKey = new Date().toISOString().slice(0, 7);
      const counter = await BillingUsageCounter.findOne({
        where: { organizationId, resource, periodKey: { [Op.eq]: periodKey } },
        attributes: ["used"], transaction, raw: true,
      });
      return Number(counter?.used ?? 0);
    }
    default: return 0;
  }
}

export async function assertPlanFeature(organizationId: string, feature: BillingFeature) {
  const entitlement = await getEntitlementForOrganization(organizationId);
  if (!entitlement.plan.features.includes(feature)) {
    throw new BillingServiceError(
      "FEATURE_NOT_AVAILABLE",
      "This feature is not available on your current plan.",
      403,
      { feature, planName: entitlement.plan.name, billingPath: "/billing" },
    );
  }
  return entitlement;
}

export async function assertPlanResourceAvailable(organizationId: string, resource: BillingResource, amount = 1, transaction?: any) {
  if (!Number.isInteger(amount) || amount < 1) throw new BillingServiceError("INVALID_USAGE_AMOUNT", "Usage amount must be a positive integer.", 400);
  const entitlement = await getEntitlementForOrganization(organizationId, transaction);
  const limit = entitlement.plan.limits?.[resource] ?? null;
  const used = await getPlanUsage(organizationId, resource, transaction);
  if (limit !== null && used + amount > Number(limit)) {
    throw new BillingServiceError(
      "PLAN_LIMIT_REACHED",
      `You have reached the ${resource.replaceAll("_", " ")} limit for your ${entitlement.plan.name} plan.`,
      403,
      { resource, used, limit: Number(limit), requested: amount, planName: entitlement.plan.name, billingPath: "/billing" },
    );
  }
  return { plan: entitlement.plan, used, limit: limit === null ? null : Number(limit) };
}