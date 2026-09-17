import "server-only";

import Role from "@/db/models/role";

import "@/db/models/associations";

import type {
  Permission as PermissionKey,
} from "@/app/shared/lib/permissions";

export async function getRolePermissions(
  roleId: string,
): Promise<PermissionKey[]> {
  const role =
    await Role.findByPk(
      roleId,
      {
        include: [
          {
            association:
              "permissions",

            attributes: [
              "key",
            ],

            through: {
              attributes: [],
            },
          },
        ],
      },
    );

  if (!role) {
    return [];
  }

  const permissions =
    role.get(
      "permissions",
    ) as Array<{
      key: PermissionKey;
    }>;

  return permissions.map(
    (permission) =>
      permission.key,
  );
}