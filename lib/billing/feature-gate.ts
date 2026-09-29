import "server-only";

import { requirePermission } from "@/lib/auth/authorization";
import { Organization } from "@/db/models";
import { hasPlanFeature, type PlanFeature, type PlanId } from "./plans";
import { BillingServiceError } from "./service";

export async function requireOrganizationFeature(feature: PlanFeature) {
  const auth = await requirePermission("DASHBOARD_VIEW");
  const organization = await Organization.findByPk(auth.organization.id, { attributes: ["planKey"] });
  const plan = organization?.planKey as PlanId | undefined;
  if (!plan || !hasPlanFeature(plan, feature)) {
    throw new BillingServiceError(`This feature is not available on the current plan.`, 403);
  }
  return auth;
}
