import "server-only";

import { Op } from "sequelize";
import { randomUUID } from "crypto";

import User from "@/db/models/user";
import Organization from "@/db/models/organization";
import OrganizationMembership from "@/db/models/organization-membership";
import Role from "@/db/models/role";
import RolePermission from "@/db/models/role-permission";
import Permission from "@/db/models/permission";

import {
  AuthorizationError,
  requirePermission,
} from "@/lib/auth/authorization";

import type {
  UserDetailData,
  UserListItem,
  UserRoleKey,
  UserRoleOption,
  UsersDirectoryData,
} from "./types";


import type {
  UpdateUserRoleInput,
} from "./validation";

const SYSTEM_ROLE_KEYS: readonly UserRoleKey[] =
  [
    "OWNER",
    "ADMIN",
    "MANAGER",
    "MEMBER",
  ];

export class UserServiceError extends Error {
  status: 400 | 404 | 409 | 500;

  constructor(
    message: string,
    status:
      | 400
      | 404
      | 409
      | 500,
  ) {
    super(message);

    this.name =
      "UserServiceError";

    this.status = status;
  }
}

function isUserRoleKey(
  value: unknown,
): value is UserRoleKey {
  return (
    value === "OWNER" ||
    value === "ADMIN" ||
    value === "MANAGER" ||
    value === "MEMBER"
  );
}

function canAssignRole(
  actorRole: UserRoleKey,
  targetRole: UserRoleKey,
) {
  if (targetRole === "OWNER") {
    return actorRole === "OWNER";
  }

  if (actorRole === "OWNER") {
    return [
      "ADMIN",
      "MANAGER",
      "MEMBER",
    ].includes(targetRole);
  }

  if (actorRole === "ADMIN") {
    return [
      "ADMIN",
      "MANAGER",
      "MEMBER",
    ].includes(targetRole);
  }

  if (actorRole === "MANAGER") {
    return targetRole === "MEMBER";
  }

  return false;
}

async function getRoleById(
  roleId: string,
) {
  const role =
    await Role.findByPk(
      roleId,
      {
        attributes: [
          "id",
          "name",
          "key",
          "description",
          "isSystemRole",
        ],
        raw: true,
      },
    );

  if (!role) {
    throw new UserServiceError(
      "The selected role does not exist.",
      400,
    );
  }

  if (
    !isUserRoleKey(role.key)
  ) {
    throw new UserServiceError(
      "The selected role is invalid.",
      400,
    );
  }

  if (!role.isSystemRole) {
    throw new UserServiceError(
      "Only system roles can currently be assigned.",
      400,
    );
  }

  return role;
}

async function getMembership({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  if (!userId) {
    throw new UserServiceError(
      "Target user ID is required.",
      400,
    );
  }

  if (!organizationId) {
    throw new UserServiceError(
      "Organization ID is required.",
      400,
    );
  }

  const membership =
    await OrganizationMembership.findOne({
      where: {
        userId,
        organizationId,
      },
      attributes: [
        "id",
        "userId",
        "organizationId",
        "roleId",
        "createdAt",
      ],
      raw: true,
    });

  if (!membership) {
    throw new UserServiceError(
      "User does not belong to this organization.",
      404,
    );
  }

  return membership;
}

async function toUserListItem(
  membership: Record<
    string,
    unknown
  >,
): Promise<UserListItem> {
  const user =
    await User.findByPk(
      String(membership.userId),
      {
        attributes: [
          "id",
          "name",
          "email",
          "image",
          "emailVerified",
          "createdAt",
        ],
        raw: true,
      },
    );

  if (!user) {
    throw new UserServiceError(
      "User no longer exists.",
      404,
    );
  }

  const role =
    await Role.findByPk(
      String(membership.roleId),
      {
        attributes: [
          "id",
          "name",
          "key",
        ],
        raw: true,
      },
    );

  if (
    !role ||
    !isUserRoleKey(role.key)
  ) {
    throw new UserServiceError(
      "User role could not be resolved.",
      500,
    );
  }

  return {
    id: String(user.id),
    membershipId: String(
      membership.id,
    ),
    name: user.name,
    email: user.email,
    image:
      user.image ?? null,
    emailVerified:
      Boolean(
        user.emailVerified,
      ),
    roleId: String(
      membership.roleId,
    ),
    roleKey: role.key,
    roleName: role.name,
    joinedAt:
      new Date(
        String(
          membership.createdAt,
        ),
      ).toISOString(),
  };
}

export async function getUsersDirectoryData(
  input: {
    search?: string;
    roleId?: string;
    page?: number;
    pageSize?: number;
  },
): Promise<UsersDirectoryData> {
  const actor =
    await requirePermission("USER_READ");

  const search =
    input.search?.trim() ?? "";

  const pageSize = Math.min(
    Math.max(
      input.pageSize ?? 20,
      1,
    ),
    100,
  );

  const requestedPage = Math.max(
    input.page ?? 1,
    1,
  );

  /*
   * Always restrict users to the actor's
   * current organization.
   */
  const membershipWhere: Record<
    string,
    unknown
  > = {
    organizationId:
      actor.organization.id,
  };

  if (input.roleId) {
    membershipWhere.roleId =
      input.roleId;
  }

  /*
   * No Sequelize associations.
   *
   * Fetch organization memberships directly.
   */
  const memberships =
    await OrganizationMembership.findAll({
      where: membershipWhere,
      attributes: [
        "id",
        "userId",
        "organizationId",
        "roleId",
        "createdAt",
      ],
      order: [
        ["createdAt", "DESC"],
      ],
      raw: true,
    });

  /*
   * Fetch selectable system roles.
   *
   * This is also used when there are no
   * organization memberships.
   */
  const roleRows =
    await Role.findAll({
      where: {
        isSystemRole: true,
        key: SYSTEM_ROLE_KEYS,
      },
      attributes: [
        "id",
        "name",
        "key",
        "description",
        "isSystemRole",
      ],
      order: [
        ["name", "ASC"],
      ],
      raw: true,
    });

  const roles: UserRoleOption[] =
    roleRows
      .filter((role) =>
        isUserRoleKey(
          role.key,
        ),
      )
      .map((role) => ({
        id: String(role.id),
        key:
          role.key as UserRoleKey,
        name: String(
          role.name,
        ),
        description:
          role.description ?? null,
        isSystemRole:
          Boolean(
            role.isSystemRole,
          ),
      }));

  /*
   * No organization members.
   */
  if (memberships.length === 0) {
    return {
      users: [],

      pagination: {
        page: 1,
        pageSize,
        totalItems: 0,
        totalPages: 1,
      },

      roles,

      stats: {
        total: 0,
        owners: 0,
        admins: 0,
        managers: 0,
        members: 0,
      },
    };
  }

  /*
   * Fetch all related users and roles directly.
   */
  const userIds =
    memberships.map(
      (membership) =>
        String(membership.userId),
    );

  const membershipRoleIds =
    memberships.map(
      (membership) =>
        String(membership.roleId),
    );

  const [
    userRows,
    membershipRoleRows,
  ] = await Promise.all([
    User.findAll({
      where: {
        id: {
          [Op.in]: userIds,
        },
      },
      attributes: [
        "id",
        "name",
        "email",
        "image",
        "emailVerified",
        "createdAt",
      ],
      raw: true,
    }),

    Role.findAll({
      where: {
        id: {
          [Op.in]:
            membershipRoleIds,
        },
      },
      attributes: [
        "id",
        "name",
        "key",
      ],
      raw: true,
    }),
  ]);

  const usersById =
    new Map(
      userRows.map((user) => [
        String(user.id),
        user,
      ]),
    );

  const rolesById =
    new Map(
      membershipRoleRows.map(
        (role) => [
          String(role.id),
          role,
        ],
      ),
    );

  /*
   * Build directory rows.
   */
  const allRows =
    memberships
      .map((membership) => {
        const user =
          usersById.get(
            String(
              membership.userId,
            ),
          );

        const role =
          rolesById.get(
            String(
              membership.roleId,
            ),
          );

        if (!user || !role) {
          return null;
        }

        if (
          !isUserRoleKey(
            role.key,
          )
        ) {
          return null;
        }

        return {
          membership,
          user,
          role,
        };
      })
      .filter(
        (
          row,
        ): row is {
          membership: Record<
            string,
            unknown
          >;
          user: Record<
            string,
            unknown
          >;
          role: Record<
            string,
            unknown
          >;
        } => row !== null,
      );

  /*
   * Stats must represent the complete
   * organization, not just the current page.
   */
  const stats = {
    total: allRows.length,
    owners: 0,
    admins: 0,
    managers: 0,
    members: 0,
  };

  for (const row of allRows) {
    switch (row.role.key) {
      case "OWNER":
        stats.owners += 1;
        break;

      case "ADMIN":
        stats.admins += 1;
        break;

      case "MANAGER":
        stats.managers += 1;
        break;

      case "MEMBER":
        stats.members += 1;
        break;
    }
  }

  /*
   * Apply search before pagination.
   */
  let filteredRows =
    allRows;

  if (search) {
    const normalizedSearch =
      search.toLowerCase();

    filteredRows =
      allRows.filter(
        ({ user }) => {
          const name =
            String(
              user.name ?? "",
            ).toLowerCase();

          const email =
            String(
              user.email ?? "",
            ).toLowerCase();

          return (
            name.includes(
              normalizedSearch,
            ) ||
            email.includes(
              normalizedSearch,
            )
          );
        },
      );
  }

  /*
   * Pagination is calculated after
   * search filtering.
   */
  const totalItems =
    filteredRows.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / pageSize,
    ),
  );

  const currentPage = Math.min(
    requestedPage,
    totalPages,
  );

  const offset =
    (currentPage - 1) *
    pageSize;

  const paginatedRows =
    filteredRows.slice(
      offset,
      offset + pageSize,
    );

  /*
   * Convert database rows into the
   * public UserListItem shape.
   */
  const users: UserListItem[] =
    paginatedRows.map(
      ({
        membership,
        user,
        role,
      }) => ({
        id: String(
          user.id,
        ),

        membershipId:
          String(
            membership.id,
          ),

        name: String(
          user.name,
        ),

        email: String(
          user.email,
        ),

        image:
          user.image
            ? String(
                user.image,
              )
            : null,

        emailVerified:
          Boolean(
            user.emailVerified,
          ),

        roleId:
          String(
            membership.roleId,
          ),

        roleKey:
          role.key as UserRoleKey,

        roleName:
          String(
            role.name,
          ),

        joinedAt:
          new Date(
            String(
              membership.createdAt,
            ),
          ).toISOString(),
      }),
    );

  return {
    users,

    pagination: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },

    roles,

    stats,
  };
}

export async function getUserDetailData(
  userId: string,
): Promise<UserDetailData> {
  const actor =
    await requirePermission(
      "USER_READ",
    );

  const membership =
    await getMembership({
      userId,
      organizationId:
        actor.organization.id,
    });

  const user =
    await toUserListItem(
      membership,
    );

  const role =
    await Role.findByPk(
      user.roleId,
      {
        attributes: [
          "id",
          "name",
          "key",
        ],
        raw: true,
      },
    );

  if (
    !role ||
    !isUserRoleKey(role.key)
  ) {
    throw new UserServiceError(
      "User role could not be resolved.",
      500,
    );
  }

  const rolePermissions =
    await RolePermission.findAll(
      {
        where: {
          roleId: role.id,
        },
        attributes: [
          "permissionId",
        ],
        raw: true,
      },
    );

  const permissionIds =
    rolePermissions.map(
      (item) =>
        item.permissionId,
    );

  const permissionRows =
    permissionIds.length
      ? await Permission.findAll(
          {
            where: {
              id: permissionIds,
            },
            attributes: [
              "key",
              "name",
              "resource",
              "action",
              "description",
            ],
            raw: true,
          },
        )
      : [];

  const permissions =
    permissionRows.map(
      (permission) => ({
        key: permission.key,
        name: permission.name,
        resource:
          permission.resource,
        action:
          permission.action,
        description:
          permission.description ??
          null,
      }),
    );

  const roles =
    await Role.findAll({
      where: {
        isSystemRole: true,
        key: SYSTEM_ROLE_KEYS,
      },
      attributes: [
        "id",
        "name",
        "key",
        "description",
        "isSystemRole",
      ],
      raw: true,
    });

  const normalizedRoles =
    roles
      .filter((role) =>
        isUserRoleKey(
          role.key,
        ),
      )
      .map(
        (role) => ({
          id: String(role.id),
          key: role.key as UserRoleKey,
          name: role.name,
          description:
            role.description ??
            null,
          isSystemRole:
            Boolean(
              role.isSystemRole,
            ),
        }),
      );

  return {
    user,
    organization: {
      id: actor.organization.id,
      name: actor.organization.name,
    },
    permissions,
    roles: normalizedRoles,
    allowedRoleKeys:
      SYSTEM_ROLE_KEYS.slice(),
    canUpdate:
      actor.permissions.includes(
        "USER_UPDATE",
      ) &&
      user.id !==
        actor.user.id &&
      canAssignRole(
        actor.membership.role,
        user.roleKey,
      ),
    canDelete:
      actor.permissions.includes(
        "USER_DELETE",
      ) &&
      user.id !==
        actor.user.id &&
      canAssignRole(
        actor.membership.role,
        user.roleKey,
      ),
    currentUserId:
      actor.user.id,
    currentRole:
      actor.membership.role,
  };
}

async function getRolePermissions(
  roleId: string,
) {
  const rolePermissions =
    await RolePermission.findAll({
      where: {
        roleId,
      },
      attributes: [
        "permissionId",
      ],
      raw: true,
    });

  const permissionIds =
    rolePermissions.map(
      (item) => item.permissionId,
    );

  const permissionRows =
    permissionIds.length
      ? await Permission.findAll({
          where: {
            id: permissionIds,
          },
          attributes: [
            "key",
            "name",
            "resource",
            "action",
            "description",
          ],
          raw: true,
        })
      : [];

  return permissionRows.map(
    (permission) => ({
      key: permission.key,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description:
        permission.description ??
        null,
    }),
  );
}

export async function updateOrganizationUserRole(
  userId: string,
  input: UpdateUserRoleInput,
) {
  const actor =
    await requirePermission(
      "USER_UPDATE",
    );

  if (
    userId === actor.user.id
  ) {
    throw new AuthorizationError(
      "You cannot change your own role.",
    );
  }

  const targetMembership =
    await getMembership(
      {
        userId,
        organizationId: actor.organization.id,
      },
    );

  const targetRole =
    await getRoleById(
      input.roleId,
    );

  if (
    !canAssignRole(
      actor.membership.role,
      targetRole.key as UserRoleKey,
    )
  ) {
    throw new AuthorizationError(
      "You do not have permission to assign this role.",
    );
  }

  /*
   * Nothing changed.
   * Still return the complete current
   * state expected by the client.
   */
  if (
    targetRole.id ===
    targetMembership.roleId
  ) {
    const user =
      await toUserListItem(
        targetMembership,
      );

    const permissions =
      await getRolePermissions(
        targetRole.id,
      );

    return {
      user,
      permissions,
    };
  }

  const updated =
    await OrganizationMembership.update(
      {
        roleId:
          targetRole.id,
      },
      {
        where: {
          id: targetMembership.id,
          organizationId:
            actor.organization.id,
        },
      },
    );

  if (
    updated[0] !== 1
  ) {
    throw new UserServiceError(
      "The role could not be updated.",
      500,
    );
  }

  const notification =
    await import(
      "@/db/models/notification"
    );

  await notification.default.create({
    id: randomUUID(),
    userId,

    organizationId:
      actor.organization.id,

    type:
      "ROLE_CHANGED",

    title:
      "Your organization role changed",

    message:
      `Your role was changed to ${targetRole.name}.`,

    metadata: {
      roleId:
        targetRole.id,

      roleKey:
        targetRole.key,

      changedByUserId:
        actor.user.id,
    },

    readAt: null,
  });


  const refreshed =
  await getMembership({
    userId,
    organizationId:
      actor.organization.id,
  });

  const user =
    await toUserListItem(
      refreshed,
    );


  const permissions =
    await getRolePermissions(
      targetRole.id,
    );

  return {
    user,
    permissions,
  };
}

export async function removeOrganizationUser(
  userId: string,
) {
  if (!userId) {
    throw new UserServiceError(
      "Target user ID is required.",
      400,
    );
  }

  const actor =
    await requirePermission(
      "USER_DELETE",
    );

  if (!actor.user?.id) {
    throw new AuthorizationError(
      "Authenticated user could not be resolved.",
      401,
    );
  }

  if (!actor.organization?.id) {
    throw new UserServiceError(
      "Organization could not be resolved.",
      400,
    );
  }

  if (userId === actor.user.id) {
    throw new AuthorizationError(
      "You cannot remove yourself from the organization.",
      403,
    );
  }

  const membership =
    await getMembership({
      userId,
      organizationId:
        actor.organization.id,
    });

  const targetUser =
    await User.findByPk(userId, {
      attributes: [
        "id",
        "name",
        "email",
      ],
      raw: true,
    });

  if (!targetUser) {
    throw new UserServiceError(
      "User no longer exists.",
      404,
    );
  }

  const targetRole =
    await Role.findByPk(
      membership.roleId,
      {
        attributes: [
          "id",
          "key",
        ],
        raw: true,
      },
    );

  if (
    !targetRole ||
    !isUserRoleKey(targetRole.key)
  ) {
    throw new UserServiceError(
      "User role could not be resolved.",
      500,
    );
  }

  if (
    !canAssignRole(
      actor.membership.role,
      targetRole.key,
    )
  ) {
    throw new AuthorizationError(
      "You do not have permission to remove this user.",
      403,
    );
  }

  if (
    targetRole.key === "OWNER"
  ) {
    const ownerRole =
      await Role.findOne({
        where: {
          key: "OWNER",
          isSystemRole: true,
        },
        attributes: ["id"],
        raw: true,
      });

    if (!ownerRole) {
      throw new UserServiceError(
        "Owner role could not be resolved.",
        500,
      );
    }

    const ownerCount =
      await OrganizationMembership.count({
        where: {
          organizationId:
            actor.organization.id,
          roleId:
            ownerRole.id,
        },
      });

    if (ownerCount <= 1) {
      throw new UserServiceError(
        "The organization must always have at least one owner.",
        409,
      );
    }
  }

  const notification =
    await import(
      "@/db/models/notification"
    );

  await notification.default.create({
    id: randomUUID(),
    userId,
    organizationId:
      actor.organization.id,
    type:
      "REMOVED_FROM_ORGANIZATION",
    title:
      "You were removed from the organization",
    message:
      `You no longer have access to ${actor.organization.name}.`,
    metadata: {
      removedByUserId:
        actor.user.id,
      organizationId:
        actor.organization.id,
    },
    readAt: null,
  });

  await OrganizationMembership.destroy({
    where: {
      id: membership.id,
      organizationId:
        actor.organization.id,
    },
  });

  return {
    success: true,
    userId,
  };
}