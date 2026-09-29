import type { AuditResource } from "./audit-types";

export const AUDIT_ACTIONS = [
  "AUTH_LOGIN", "AUTH_LOGOUT",
  "USER_CREATED", "USER_ROLE_CHANGED", "USER_REMOVED",
  "INVITATION_CREATED", "INVITATION_ACCEPTED", "INVITATION_RESENT", "INVITATION_REVOKED", "INVITATION_BULK_IMPORTED",
  "DOCUMENT_CREATED", "DOCUMENT_UPDATED", "DOCUMENT_DELETED", "DOCUMENT_SHARED",
  "KNOWLEDGE_BASE_CREATED", "KNOWLEDGE_BASE_UPDATED", "KNOWLEDGE_BASE_DELETED",
  "ROLE_PERMISSION_CHANGED", "ORGANIZATION_SETTING_UPDATED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

type AuditActionMeta = {
  label: string;
  description: string;
  resource: AuditResource;
  resourceLabel: string;
};

export const AUDIT_ACTION_META: Record<AuditAction, AuditActionMeta> = {
  AUTH_LOGIN: { label: "Signed in", description: "A user signed in to the organization.", resource: "AUTH", resourceLabel: "Authentication" },
  AUTH_LOGOUT: { label: "Signed out", description: "A user signed out of the organization.", resource: "AUTH", resourceLabel: "Authentication" },
  USER_CREATED: { label: "User created", description: "A user account was created.", resource: "USER", resourceLabel: "User" },
  USER_ROLE_CHANGED: { label: "Role changed", description: "A user's organization role was changed.", resource: "USER", resourceLabel: "User" },
  USER_REMOVED: { label: "User removed", description: "A user was removed from the organization.", resource: "USER", resourceLabel: "User" },
  INVITATION_CREATED: { label: "Invitation created", description: "An organization invitation was created.", resource: "INVITATION", resourceLabel: "Invitation" },
  INVITATION_ACCEPTED: { label: "Invitation accepted", description: "An organization invitation was accepted.", resource: "INVITATION", resourceLabel: "Invitation" },
  INVITATION_RESENT: { label: "Invitation resent", description: "An organization invitation was resent.", resource: "INVITATION", resourceLabel: "Invitation" },
  INVITATION_REVOKED: { label: "Invitation revoked", description: "An organization invitation was revoked.", resource: "INVITATION", resourceLabel: "Invitation" },
  INVITATION_BULK_IMPORTED: { label: "Invitations imported", description: "Invitations were imported in bulk.", resource: "INVITATION", resourceLabel: "Invitation" },
  DOCUMENT_CREATED: { label: "Document created", description: "A document was created.", resource: "DOCUMENT", resourceLabel: "Document" },
  DOCUMENT_UPDATED: { label: "Document updated", description: "A document was updated.", resource: "DOCUMENT", resourceLabel: "Document" },
  DOCUMENT_DELETED: { label: "Document deleted", description: "A document was deleted.", resource: "DOCUMENT", resourceLabel: "Document" },
  DOCUMENT_SHARED: { label: "Document shared", description: "Document knowledge-base access was changed.", resource: "DOCUMENT", resourceLabel: "Document" },
  KNOWLEDGE_BASE_CREATED: { label: "Knowledge base created", description: "A knowledge base was created.", resource: "KNOWLEDGE_BASE", resourceLabel: "Knowledge Base" },
  KNOWLEDGE_BASE_UPDATED: { label: "Knowledge base updated", description: "A knowledge base was updated.", resource: "KNOWLEDGE_BASE", resourceLabel: "Knowledge Base" },
  KNOWLEDGE_BASE_DELETED: { label: "Knowledge base deleted", description: "A knowledge base was deleted.", resource: "KNOWLEDGE_BASE", resourceLabel: "Knowledge Base" },
  ROLE_PERMISSION_CHANGED: { label: "Role permissions changed", description: "A role's permissions were changed.", resource: "ROLE", resourceLabel: "Role" },
  ORGANIZATION_SETTING_UPDATED: { label: "Organization setting updated", description: "An organization setting was changed.", resource: "ORGANIZATION", resourceLabel: "Organization" },
};

export const AUDIT_RESOURCE_LABELS: Record<AuditResource, string> = {
  AUTH: "Authentication",
  USER: "User",
  INVITATION: "Invitation",
  DOCUMENT: "Document",
  KNOWLEDGE_BASE: "Knowledge Base",
  ROLE: "Role",
  ORGANIZATION: "Organization",
  AUDIT_LOG: "Audit history",
};

export function isAuditAction(value: string): value is AuditAction {
  return (AUDIT_ACTIONS as readonly string[]).includes(value);
}

export function isAuditResource(value: string): value is AuditResource {
  return (Object.keys(AUDIT_RESOURCE_LABELS) as AuditResource[]).includes(value as AuditResource);
}

export function getAuditActionMeta(action: string, resource: string) {
  if (isAuditAction(action)) return AUDIT_ACTION_META[action];
  const normalizedResource = isAuditResource(resource) ? resource : "AUDIT_LOG";
  return {
    label: "Activity recorded",
    description: "An organization activity was recorded.",
    resource: normalizedResource,
    resourceLabel: AUDIT_RESOURCE_LABELS[normalizedResource],
  };
}
