export const PERMISSIONS = [
  "DASHBOARD_VIEW",

  "DOCUMENT_READ",
  "DOCUMENT_CREATE",
  "DOCUMENT_UPDATE",
  "DOCUMENT_DELETE",

  "USER_READ",
  "USER_INVITE",
  "USER_UPDATE",
  "USER_DELETE",

  "INVITATION_READ",
  "INVITATION_CREATE",
  "INVITATION_IMPORT",
  "INVITATION_RESEND",
  "INVITATION_REVOKE",

  "AI_USE",

  "ANALYTICS_READ",

  "BILLING_READ",
  "BILLING_MANAGE",

  "SECURITY_READ",
  "SECURITY_MANAGE",

  "AUDIT_LOG_READ",

  "ORGANIZATION_SETTINGS_READ",
  "ORGANIZATION_SETTINGS_UPDATE",
] as const;

export type Permission =
  (typeof PERMISSIONS)[number];

export const ROLES = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MEMBER",
] as const;

export type Role =
  (typeof ROLES)[number];

export function isPermission(
  value: unknown,
): value is Permission {
  return (
    typeof value === "string" &&
    PERMISSIONS.includes(
      value as Permission,
    )
  );
}

export function isRole(
  value: unknown,
): value is Role {
  return (
    typeof value === "string" &&
    ROLES.includes(
      value as Role,
    )
  );
}

export function permissionGranted(
  permissions: readonly Permission[],
  permission: Permission,
): boolean {
  return permissions.includes(
    permission,
  );
}

export function hasAnyPermission(
  permissions: readonly Permission[],
  required: readonly Permission[],
): boolean {
  return required.some(
    (permission) =>
      permissions.includes(permission),
  );
}

export function hasAllPermissions(
  permissions: readonly Permission[],
  required: readonly Permission[],
): boolean {
  return required.every(
    (permission) =>
      permissions.includes(permission),
  );
}