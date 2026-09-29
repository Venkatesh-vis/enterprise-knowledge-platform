export type PlanId = "starter" | "business" | "enterprise";
export type BillingCycle = "monthly" | "yearly";
export type PlanFeature =
  | "KNOWLEDGE_WORKSPACE"
  | "DOCUMENT_MANAGEMENT"
  | "AI_ASSISTANT"
  | "STANDARD_RBAC"
  | "ADVANCED_RBAC"
  | "AUDIT_LOGS"
  | "ADVANCED_ANALYTICS"
  | "PRIORITY_SUPPORT";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  monthlyPricePaise: number;
  yearlyPricePaise: number;
  limits: {
    users: number;
    storageBytes: number;
    knowledgeBases: number;
    usageCredits: number;
  };
  features: readonly PlanFeature[];
};

const GB = 1024 * 1024 * 1024;

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPricePaise: 99900,
    yearlyPricePaise: 959000,
    limits: {
      users: 10,
      storageBytes: 25 * GB,
      knowledgeBases: 5,
      usageCredits: 1000,
    },
    features: [
      "KNOWLEDGE_WORKSPACE",
      "DOCUMENT_MANAGEMENT",
      "AI_ASSISTANT",
      "STANDARD_RBAC",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    monthlyPricePaise: 299900,
    yearlyPricePaise: 2879000,
    limits: {
      users: 50,
      storageBytes: 100 * GB,
      knowledgeBases: 20,
      usageCredits: 10000,
    },
    features: [
      "KNOWLEDGE_WORKSPACE",
      "DOCUMENT_MANAGEMENT",
      "AI_ASSISTANT",
      "STANDARD_RBAC",
      "ADVANCED_RBAC",
      "AUDIT_LOGS",
      "ADVANCED_ANALYTICS",
      "PRIORITY_SUPPORT",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPricePaise: 799900,
    yearlyPricePaise: 7679000,
    limits: {
      users: 250,
      storageBytes: 500 * GB,
      knowledgeBases: 100,
      usageCredits: 50000,
    },
    features: [
      "KNOWLEDGE_WORKSPACE",
      "DOCUMENT_MANAGEMENT",
      "AI_ASSISTANT",
      "STANDARD_RBAC",
      "ADVANCED_RBAC",
      "AUDIT_LOGS",
      "ADVANCED_ANALYTICS",
      "PRIORITY_SUPPORT",
    ],
  },
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLAN_DEFINITIONS;
}

export function isBillingCycle(value: unknown): value is BillingCycle {
  return value === "monthly" || value === "yearly";
}

export function getPlanPrice(plan: PlanId, cycle: BillingCycle) {
  return cycle === "monthly"
    ? PLAN_DEFINITIONS[plan].monthlyPricePaise
    : PLAN_DEFINITIONS[plan].yearlyPricePaise;
}

export function hasPlanFeature(plan: PlanId, feature: PlanFeature) {
  return PLAN_DEFINITIONS[plan].features.includes(feature);
}
