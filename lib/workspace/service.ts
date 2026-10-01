import "server-only";

import { Op } from "sequelize";

import {
  BillingUsageCounter,
  Document,
  KnowledgeBase,
  OrganizationMembership,
} from "@/db/models";
import { requirePermission } from "@/lib/auth/authorization";

  documents: number;
  knowledgeBases: number;
  members: number;
  storageBytes: number;
  storageMb: number;
  aiQueriesMonth: number;

export async function getWorkspaceOverview(): Promise<WorkspaceOverview> {
  const auth = await requirePermission("DASHBOARD_VIEW");

  const periodKey = new Date().toISOString().slice(0, 7);

  const [
    documents,
    knowledgeBases,
    members,
    storageBytes,
    aiQueryCounter,
  ] = await Promise.all([
    Document.count({
      where: {
        organizationId: auth.organization.id,
      },
    }),
    KnowledgeBase.count({
      where: {
        organizationId: auth.organization.id,
      },
    }),
    OrganizationMembership.count({
      where: {
        organizationId: auth.organization.id,
      },
    }),
    Document.sum("sizeBytes", {
      where: {
        organizationId: auth.organization.id,
      },
    }),
    BillingUsageCounter.findOne({
      where: {
        organizationId: auth.organization.id,
        resource: "ai_queries_month",
        periodKey: {
          [Op.eq]: periodKey,
        },
      },
      attributes: ["used"],
      raw: true,
    }),
  ]);

  const normalizedStorageBytes = Number(storageBytes ?? 0);

  return {
    documents: Number(documents),
    knowledgeBases: Number(knowledgeBases),
    members: Number(members),
    storageBytes: normalizedStorageBytes,
    storageMb: Math.ceil(normalizedStorageBytes / 1024 / 1024),
    aiQueriesMonth: Number(aiQueryCounter?.used ?? 0),
  };
}
