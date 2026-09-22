import "server-only";

import type {
  Permission,
} from "@/app/shared/lib/permissions";

import {
  getCurrentUser,
} from "./get-current-user";

export type SystemRoleKey =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "MEMBER";

export class AuthenticationError
  extends Error {
  status = 401;

  constructor(
    message =
      "Not authenticated.",
  ) {
    super(message);

    this.name =
      "AuthenticationError";
  }
}

export class AuthorizationError
  extends Error {
  status = 403;

  constructor(
    message =
      "You do not have permission to perform this action.",
  ) {
    super(message);

    this.name =
      "AuthorizationError";
  }
}

export async function requireAuth() {
  const auth =
    await getCurrentUser();

  if (!auth) {
    throw new AuthenticationError();
  }

  return auth;
}

export async function requirePermission(
  permission: Permission,
) {
  const auth =
    await requireAuth();

  if (
    !auth.permissions.includes(
      permission,
    )
  ) {
    throw new AuthorizationError();
  }

  return auth;
}

export async function requireAnyPermission(
  permissions: readonly Permission[],
) {
  const auth =
    await requireAuth();

  const allowed =
    permissions.some(
      (permission) =>
        auth.permissions.includes(
          permission,
        ),
    );

  if (!allowed) {
    throw new AuthorizationError();
  }

  return auth;
}

export function canAssignRole(
  actorRole: string,
  targetRole: string,
) {
  if (
    targetRole === "OWNER"
  ) {
    return actorRole === "OWNER";
  }

  if (
    actorRole === "OWNER"
  ) {
    return [
      "ADMIN",
      "MANAGER",
      "MEMBER",
    ].includes(targetRole);
  }

  if (
    actorRole === "ADMIN"
  ) {
    return [
      "ADMIN",
      "MANAGER",
      "MEMBER",
    ].includes(targetRole);
  }

  if (
    actorRole === "MANAGER"
  ) {
    return targetRole === "MEMBER";
  }

  return false;
}