export const BILLING_FEATURES = {
  KNOWLEDGE_BASE: "KNOWLEDGE_BASE",
  ADVANCED_SEARCH: "ADVANCED_SEARCH",
  AI_ASSISTANT: "AI_ASSISTANT",
  DOCUMENT_UPLOAD: "DOCUMENT_UPLOAD",
  ANALYTICS: "ANALYTICS",
  EXPORT: "EXPORT",
  TEAM_MEMBERS: "TEAM_MEMBERS",
  API_ACCESS: "API_ACCESS",
  CUSTOM_BRANDING: "CUSTOM_BRANDING",
} as const;

export const BILLING_RESOURCES = {
  DOCUMENTS: "documents",
  KNOWLEDGE_BASES: "knowledge_bases",
  TEAM_MEMBERS: "team_members",
  AI_QUERIES_MONTH: "ai_queries_month",
  STORAGE_MB: "storage_mb",
} as const;

export type BillingFeature = typeof BILLING_FEATURES[keyof typeof BILLING_FEATURES];
export type BillingResource = typeof BILLING_RESOURCES[keyof typeof BILLING_RESOURCES];
