export type Role =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "MEMBER";

export type Permission =
  | "DASHBOARD_VIEW"
  | "DOCUMENT_READ"
  | "DOCUMENT_CREATE"
  | "DOCUMENT_UPDATE"
  | "DOCUMENT_DELETE"
  | "USER_READ"
  | "USER_INVITE"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "AI_USE"
  | "ANALYTICS_READ"
  | "BILLING_READ"
  | "BILLING_MANAGE"
  | "SECURITY_READ"
  | "SECURITY_MANAGE"
  | "ORGANIZATION_SETTINGS_READ"
  | "ORGANIZATION_SETTINGS_UPDATE";

const rolePermissions: Record<Role, readonly Permission[]> = {
  OWNER: [
    "DASHBOARD_VIEW",
    "DOCUMENT_READ",
    "DOCUMENT_CREATE",
    "DOCUMENT_UPDATE",
    "DOCUMENT_DELETE",
    "USER_READ",
    "USER_INVITE",
    "USER_UPDATE",
    "USER_DELETE",
    "AI_USE",
    "ANALYTICS_READ",
    "BILLING_READ",
    "BILLING_MANAGE",
    "SECURITY_READ",
    "SECURITY_MANAGE",
    "ORGANIZATION_SETTINGS_READ",
    "ORGANIZATION_SETTINGS_UPDATE",
  ],

  ADMIN: [
    "DASHBOARD_VIEW",
    "DOCUMENT_READ",
    "DOCUMENT_CREATE",
    "DOCUMENT_UPDATE",
    "DOCUMENT_DELETE",
    "USER_READ",
    "USER_INVITE",
    "USER_UPDATE",
    "USER_DELETE",
    "AI_USE",
    "ANALYTICS_READ",
    "BILLING_READ",
    "SECURITY_READ",
    "SECURITY_MANAGE",
    "ORGANIZATION_SETTINGS_READ",
    "ORGANIZATION_SETTINGS_UPDATE",
  ],

  MANAGER: [
    "DASHBOARD_VIEW",
    "DOCUMENT_READ",
    "DOCUMENT_CREATE",
    "DOCUMENT_UPDATE",
    "DOCUMENT_DELETE",
    "USER_READ",
    "USER_INVITE",
    "AI_USE",
    "ANALYTICS_READ",
    "ORGANIZATION_SETTINGS_READ",
  ],

  MEMBER: [
    "DASHBOARD_VIEW",
    "DOCUMENT_READ",
    "AI_USE",
  ],
};

export function getRolePermissions(
  role: Role,
): readonly Permission[] {
  return rolePermissions[role] ?? [];
}

export function hasPermission(
  role: Role,
  permission: Permission,
): boolean {
  return getRolePermissions(role).includes(permission);
}

export function hasAnyPermission(
  role: Role,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) =>
    hasPermission(role, permission),
  );
}

export function hasAllPermissions(
  role: Role,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) =>
    hasPermission(role, permission),
  );
}