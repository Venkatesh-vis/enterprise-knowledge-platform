import "server-only";

import { cookies } from "next/headers";

import User from "@/db/models/user";
import OrganizationMembership from "@/db/models/organization-membership";
import "@/db/models/associations";

import {
  AUTH_COOKIE_NAME,
} from "@/lib/auth/cookie";

import {
  verifyAccessToken,
} from "@/lib/auth/jwt";

import {
  getRolePermissions,
} from "@/lib/auth/get-permissions";

import type {
  AuthSnapshot,
} from "@/app/shared/lib/auth/types";

export async function getCurrentUserId() {
  const store =
    await cookies();

  const token =
    store.get(
      AUTH_COOKIE_NAME,
    )?.value;

  if (!token) {
    return null;
  }

  try {
    const claims =
      await verifyAccessToken(
        token,
      );

    return claims.sub;
  } catch {
    return null;
  }
}

export async function getCurrentAuth(): Promise<
  AuthSnapshot | null
> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return null;
  }

  try {
    const user =
      await User.findByPk(
        userId,
        {
          attributes: [
            "id",
            "name",
            "email",
            "image",
          ],

          raw: true,
        },
      );

    if (!user) {
      return null;
    }

    const membership =
      await OrganizationMembership.findOne(
        {
          where: {
            userId: user.id,
          },

          include: [
            {
              association:
                "organization",

              attributes: [
                "id",
                "name",
                "slug",
              ],

              required: true,
            },

            {
              association: "role",

              attributes: [
                "id",
                "key",
                "name",
              ],

              required: true,

              include: [
                {
                  association:
                    "permissions",

                  attributes: [
                    "id",
                    "key",
                  ],

                  through: {
                    attributes: [],
                  },
                },
              ],
            },
          ],

          order: [
            ["createdAt", "ASC"],
          ],
        },
      );

    if (!membership) {
      return null;
    }

    const role =
      membership.get(
        "role",
      ) as {
        id: string;
        key: string;
      } | null;

    const organization =
      membership.get(
        "organization",
      ) as {
        id: string;
        name: string;
        slug: string;
      } | null;

    if (
      !role ||
      !organization
    ) {
      return null;
    }

    const permissions =
      await getRolePermissions(
        role.id,
      );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image:
          user.image ?? null,
      },

      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },

      membership: {
        id: membership.id,
        roleId: role.id,
        role: role.key as AuthSnapshot["membership"]["role"],
      },

      permissions,
    };
  } catch {
    return null;
  }
}