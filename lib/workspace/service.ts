import "server-only";

import { Op } from "sequelize";

import {
  BillingUsageCounter,
  Document,
  KnowledgeBase,
  OrganizationMembership,
} from "@/db/models";
import { getEntitlementForOrganization } from "@/lib/billing/service";
import { requirePermission } from "@/lib/auth/authorization";
import { createRedisKey, getRedisJson, setRedisJson } from "@/lib/cache/redis";
import type { WorkspaceOverview } from "./types";

const WORKSPACE_OVERVIEW_TTL_SECONDS = 10;

export async function getWorkspaceOverview(): Promise<WorkspaceOverview> {
  const auth = await requirePermission("DASHBOARD_VIEW");
  const cacheKey = createRedisKey("workspace", "overview", auth.organization.id);
  const cached = await getRedisJson<WorkspaceOverview>(cacheKey);

  if (cached) {
    return cached;
  }

  const periodKey = new Date().toISOString().slice(0, 7);

  const [documents, knowledgeBases, members, storageBytes, aiQueryCounter, entitlement] =
    await Promise.all([
      Document.count({
        where: { organizationId: auth.organization.id },
      }),
      KnowledgeBase.count({
        where: { organizationId: auth.organization.id },
      }),
      OrganizationMembership.count({
        where: { organizationId: auth.organization.id },
      }),
      Document.sum("sizeBytes", {
        where: { organizationId: auth.organization.id },
      }),
      BillingUsageCounter.findOne({
        where: {
          organizationId: auth.organization.id,
          resource: "ai_queries_month",
          periodKey: { [Op.eq]: periodKey },
        },
        attributes: ["used"],
        raw: true,
      }),
      getEntitlementForOrganization(auth.organization.id),
    ]);

  const normalizedStorageBytes = Number(storageBytes ?? 0);
  const aiCreditsUsed = Number(aiQueryCounter?.used ?? 0);
  const configuredLimit = entitlement.plan.limits?.ai_queries_month;
  const aiCreditsLimit =
    configuredLimit == null ? null : Math.max(0, Number(configuredLimit));

  const overview: WorkspaceOverview = {
    documents: Number(documents),
    knowledgeBases: Number(knowledgeBases),
    members: Number(members),
    storageBytes: normalizedStorageBytes,
    storageMb: Math.ceil(normalizedStorageBytes / 1024 / 1024),
    aiQueriesMonth: aiCreditsUsed,
    aiCreditsUsed,
    aiCreditsLimit,
    aiCreditsRemaining:
      aiCreditsLimit === null
        ? null
        : Math.max(0, aiCreditsLimit - aiCreditsUsed),
  };

  await setRedisJson(cacheKey, overview, WORKSPACE_OVERVIEW_TTL_SECONDS);
  return overview;
}
