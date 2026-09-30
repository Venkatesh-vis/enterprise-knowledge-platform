import "server-only";

import { randomUUID } from "node:crypto";
import { BillingUsageCounter } from "@/db/models";
import { BillingServiceError } from "./errors";

export async function consumeUsageWithPlan(input: {
  organizationId: string;
  resource: string;
  amount: number;
  limit: number | null;
  featureEnabled: boolean;
  transaction: any;
}) {
  if (!input.featureEnabled) throw new BillingServiceError("FEATURE_NOT_AVAILABLE", "This feature is not available on your current plan.", 403);
  if (!Number.isInteger(input.amount) || input.amount < 1) throw new BillingServiceError("INVALID_USAGE_AMOUNT", "Usage amount must be a positive integer.", 400);

  const periodKey = input.resource === "ai_queries_month" ? new Date().toISOString().slice(0, 7) : "lifetime";
  let counter = await BillingUsageCounter.findOne({ where: { organizationId: input.organizationId, resource: input.resource, periodKey }, transaction: input.transaction, lock: input.transaction.LOCK.UPDATE });
  if (!counter) {
    counter = await BillingUsageCounter.create({ id: randomUUID(), organizationId: input.organizationId, resource: input.resource, periodKey, used: 0 }, { transaction: input.transaction });
    counter = await BillingUsageCounter.findOne({ where: { id: counter.id }, transaction: input.transaction, lock: input.transaction.LOCK.UPDATE });
  }

  const used = Number(counter?.used ?? 0);
  if (input.limit !== null && used + input.amount > input.limit) {
    throw new BillingServiceError("PLAN_LIMIT_REACHED", `You have reached the ${input.resource} limit for your current plan.`, 403, { limit: input.limit, used });
  }

  await counter!.increment("used", { by: input.amount, transaction: input.transaction });
  return { used: used + input.amount, limit: input.limit };
}
