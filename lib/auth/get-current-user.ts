import "server-only";

import { cookies } from "next/headers";
import User from "@/db/models/user";
import Organization from "@/db/models/organization";
import OrganizationMembership from "@/db/models/organization-membership";
import Role from "@/db/models/role";
import RolePermission from "@/db/models/role-permission";
import Permission from "@/db/models/permission";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";
import { verifyAccessToken } from "@/lib/auth/jwt";
import type { AuthSnapshot } from "@/app/shared/lib/auth/types";
import type { Permission as PermissionKey, Role as RoleKey } from "@/app/shared/lib/permissions";

export async function getCurrentUserId() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try { return (await verifyAccessToken(token)).sub; } catch { return null; }
}

export async function getCurrentUser(): Promise<AuthSnapshot | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const user = await User.findByPk(userId, { attributes: ["id", "name", "email", "image"], raw: true });
    if (!user) return null;

    const membership = await OrganizationMembership.findOne({
      where: { userId: user.id },
      attributes: ["id", "organizationId", "roleId"],
      order: [["createdAt", "ASC"]],
      raw: true,
    });
    if (!membership) return null;

    const organization = await Organization.findByPk(membership.organizationId, {
      attributes: ["id", "name", "slug", "planKey", "billingCycle", "subscriptionStatus", "currentPeriodStart", "currentPeriodEnd"],
      raw: true,
    });
    if (!organization) return null;

    const role = await Role.findByPk(membership.roleId, { attributes: ["id", "key", "name"], raw: true });
    if (!role) return null;

    const rolePermissions = await RolePermission.findAll({ where: { roleId: role.id }, attributes: ["permissionId"], raw: true });
    const permissionIds = rolePermissions.map((item: { permissionId: number }) => item.permissionId);
    const permissionRows = permissionIds.length
      ? await Permission.findAll({ where: { id: permissionIds }, attributes: ["key"], raw: true })
      : [];

    return {
      user: { id: user.id, name: user.name, email: user.email, image: user.image ?? null },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        planKey: organization.planKey,
        billingCycle: organization.billingCycle,
        subscriptionStatus: organization.subscriptionStatus,
        currentPeriodStart: organization.currentPeriodStart ? new Date(organization.currentPeriodStart).toISOString() : null,
        currentPeriodEnd: organization.currentPeriodEnd ? new Date(organization.currentPeriodEnd).toISOString() : null,
      },
      membership: { id: membership.id, roleId: role.id, role: role.key as RoleKey },
      permissions: permissionRows.map((item: { key: string }) => item.key as PermissionKey),
    };
  } catch (error) {
    console.error("Failed to load current user:", error);
    return null;
  }
}

export const getCurrentAuth = getCurrentUser;
