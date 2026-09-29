import "server-only";

import { Organization, OrganizationMembership } from "@/db/models";
import { PLAN_DEFINITIONS, type PlanId } from "./plans";

export class PlanLimitError extends Error {
  status = 409;
}

export async function assertCanAddUsers(organizationId: string, additionalUsers = 1) {
  if (!Number.isInteger(additionalUsers) || additionalUsers < 1) {
    throw new PlanLimitError("Additional user count must be a positive integer.");
  }

  const organization = await Organization.findByPk(organizationId, { attributes: ["planKey"] });
  if (!organization) throw new PlanLimitError("Organization not found.");

  const plan = PLAN_DEFINITIONS[organization.planKey as PlanId];
  const currentUsers = await OrganizationMembership.count({ where: { organizationId } });

  if (currentUsers + additionalUsers > plan.limits.users) {
    throw new PlanLimitError(`Your ${plan.name} plan allows ${plan.limits.users} users. Upgrade the plan before adding more users.`);
  }
}

export async function getPlanUsage(organizationId: string) {
  const organization = await Organization.findByPk(organizationId, { attributes: ["planKey"] });
  if (!organization) throw new PlanLimitError("Organization not found.");
  const plan = PLAN_DEFINITIONS[organization.planKey as PlanId];
  const users = await OrganizationMembership.count({ where: { organizationId } });
  return { users, userLimit: plan.limits.users, plan: plan.id };
}
