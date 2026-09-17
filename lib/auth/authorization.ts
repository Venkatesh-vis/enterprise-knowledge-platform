import "server-only";

import { getCurrentUser } from "./get-current-user";

import type { Permission } from "@/app/shared/lib/permissions";

export class AuthenticationError extends Error {
  status = 401;

  constructor(
    message = "Not authenticated.",
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  status = 403;

  constructor(
    message = "You do not have permission to perform this action.",
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireAuth() {
  const auth = await getCurrentUser();

  if (!auth) {
    throw new AuthenticationError();
  }

  return auth;
}

export async function requirePermission(
  permission: Permission,
) {
  const auth = await requireAuth();

  if (!auth.permissions.includes(permission)) {
    throw new AuthorizationError();
  }

  return auth;
}