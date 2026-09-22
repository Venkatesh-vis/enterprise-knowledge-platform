import "server-only";

import { randomUUID } from "crypto";
import { Op, Transaction } from "sequelize";

import { Invitation, Organization, OrganizationMembership, Role, User } from "@/db/models";
import AuditLog from "@/db/models/audit-log";
import sequelize from "@/lib/database";
import { canAssignRole, requirePermission } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAuditLog } from "@/lib/audit/audit-service";
import { sendInvitationEmail } from "@/lib/email/invitation-email";

import {
  INVITATION_MAX_IMPORT_ROWS,
  INVITATION_RESEND_COOLDOWN_SECONDS,
  INVITATION_ROLE_KEYS,
  ROLE_LABELS,
} from "./constants";
import {
  createInvitationActiveKey,
  createInvitationExpiry,
  createInvitationToken,
  hashInvitationToken,
} from "./token";
import type {
  CreateInvitationInput,
  ImportInvitationInput,
  InvitationDetail,
  InvitationListItem,
  InvitationPageData,
  InvitationRoleKey,
  InvitationStatus,
  PublicInvitationData,
} from "./types";

export class InvitationServiceError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400,
  ) {
    super(message);
    this.name = "InvitationServiceError";
    this.status = status;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function assertRole(
  roleKey: string,
): asserts roleKey is InvitationRoleKey {
  if (
    !INVITATION_ROLE_KEYS.includes(
      roleKey as InvitationRoleKey,
    )
  ) {
    throw new InvitationServiceError(
      "Invalid invitation role.",
    );
  }
}

async function getRole(
  roleKey: InvitationRoleKey,
  transaction?: Transaction,
) {
  return Role.findOne({
    where: { key: roleKey },
    attributes: [
      "id",
      "key",
      "name",
      "description",
    ],
    raw: true,
    transaction,
  });
}

async function expireIfNeeded(
  invitation: any,
  transaction?: Transaction,
) {
  if (
    invitation.status === "PENDING" &&
    new Date(invitation.expiresAt).getTime() <=
      Date.now()
  ) {
    await invitation.update(
      {
        status: "EXPIRED",
        activeKey: null,
      },
      { transaction },
    );
    return "EXPIRED";
  }

  return invitation.status;
}

function serializeInvitation(
  row: any,
): InvitationListItem {
  const roleKey = String(
    row.role?.key ?? "MEMBER",
  ) as InvitationRoleKey;

  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    roleKey,
    roleName: String(
      row.role?.name ?? ROLE_LABELS[roleKey],
    ),
    status: String(
      row.status,
    ) as InvitationStatus,
    createdAt: new Date(
      row.createdAt,
    ).toISOString(),
    expiresAt: new Date(
      row.expiresAt,
    ).toISOString(),
    lastSentAt: new Date(
      row.lastSentAt,
    ).toISOString(),
    invitedByName: String(
      row.invitedBy?.name ?? "Unknown",
    ),
    sendCount: Number(row.sendCount ?? 0),
  };
}

async function getInvitationById(
  id: string,
  organizationId: string,
) {
  if (!id?.trim()) {
    throw new InvitationServiceError(
      "Invitation ID is required.",
    );
  }

  const row = await Invitation.findOne({
    where: { id, organizationId },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "key", "name"],
      },
      {
        model: User,
        as: "invitedBy",
        attributes: ["id", "name", "email"],
      },
      {
        model: Organization,
        as: "organization",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!row) {
    throw new InvitationServiceError(
      "Invitation not found.",
      404,
    );
  }

  await expireIfNeeded(row);
  return row;
}

export async function getInvitationPageData({
  query = "",
  status = "ALL",
  role = "ALL",
  page = 1,
  pageSize = 20,
}: {
  query?: string;
  status?: InvitationStatus | "ALL";
  role?: InvitationRoleKey | "ALL";
  page?: number;
  pageSize?: number;
} = {}): Promise<InvitationPageData> {
  const auth = await requirePermission(
    "INVITATION_READ",
  );

  const safePage = Math.max(
    1,
    Number(page) || 1,
  );
  const safePageSize = Math.min(
    100,
    Math.max(1, Number(pageSize) || 20),
  );
  const normalizedQuery = query
    .trim()
    .slice(0, 100);

  const where: any = {
    organizationId: auth.organization.id,
  };

  if (status !== "ALL") {
    where.status = status;
  }

  if (role !== "ALL") {
    assertRole(role);
    const selectedRole = await getRole(role);

    if (!selectedRole) {
      throw new InvitationServiceError(
        "Invalid role filter.",
      );
    }

    where.roleId = selectedRole.id;
  }

  if (normalizedQuery) {
    where[Op.or] = [
      {
        email: {
          [Op.like]: `%${normalizedQuery}%`,
        },
      },
      {
        name: {
          [Op.like]: `%${normalizedQuery}%`,
        },
      },
    ];
  }

  await Invitation.update(
    {
      status: "EXPIRED",
      activeKey: null,
    },
    {
      where: {
        organizationId: auth.organization.id,
        status: "PENDING",
        expiresAt: {
          [Op.lte]: new Date(),
        },
      },
    },
  );

  const { count, rows } =
    await Invitation.findAndCountAll({
      where,
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["key", "name"],
        },
        {
          model: User,
          as: "invitedBy",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset: (safePage - 1) * safePageSize,
      limit: safePageSize,
    });

  const all = await Invitation.findAll({
    where: {
      organizationId: auth.organization.id,
    },
    attributes: ["status"],
    raw: true,
  });

  const stats = {
    total: all.length,
    pending: 0,
    accepted: 0,
    expired: 0,
    revoked: 0,
  };

  for (const item of all as any[]) {
    if (item.status === "PENDING") stats.pending += 1;
    if (item.status === "ACCEPTED") stats.accepted += 1;
    if (item.status === "EXPIRED") stats.expired += 1;
    if (item.status === "REVOKED") stats.revoked += 1;
  }

  const roles = await Role.findAll({
    where: { key: INVITATION_ROLE_KEYS },
    attributes: ["key", "name", "description"],
    raw: true,
  });

  const allowedRoleKeys =
    INVITATION_ROLE_KEYS.filter((key) =>
      canAssignRole(
        auth.membership.role,
        key,
      ),
    );

  return {
    organization: auth.organization,
    currentUserId: auth.user.id,
    invitations: rows.map(serializeInvitation),
    stats,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      totalItems: Number(count),
      totalPages: Math.max(
        1,
        Math.ceil(
          Number(count) / safePageSize,
        ),
      ),
    },
    filters: {
      query: normalizedQuery,
      status,
      role,
    },
    roles: roles.map((item: any) => ({
      value: item.key as InvitationRoleKey,
      label: item.name,
      description: item.description ?? "",
    })),
    allowedRoleKeys,
    currentRole:
      auth.membership.role as InvitationRoleKey,
    permissions: {
      canRead:
        auth.permissions.includes(
          "INVITATION_READ",
        ),
      canCreate:
        auth.permissions.includes(
          "INVITATION_CREATE",
        ),
      canImport:
        auth.permissions.includes(
          "INVITATION_IMPORT",
        ),
      canResend:
        auth.permissions.includes(
          "INVITATION_RESEND",
        ),
      canRevoke:
        auth.permissions.includes(
          "INVITATION_REVOKE",
        ),
    },
  };
}

async function validateCreate(
  input: CreateInvitationInput,
) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();

  assertRole(input.roleKey);

  if (
    name.length < 2 ||
    name.length > 100
  ) {
    throw new InvitationServiceError(
      "Name must be between 2 and 100 characters.",
    );
  }

  if (
    email.length > 255 ||
    !/^\S+@\S+\.\S+$/.test(email)
  ) {
    throw new InvitationServiceError(
      "Enter a valid email address.",
    );
  }

  const auth = await requirePermission(
    "INVITATION_CREATE",
  );

  if (
    !canAssignRole(
      auth.membership.role,
      input.roleKey,
    )
  ) {
    throw new InvitationServiceError(
      "You are not allowed to assign this role.",
      403,
    );
  }

  const user = await User.findOne({
    where: { email },
    attributes: ["id"],
  });

  if (
    user &&
    (await OrganizationMembership.findOne({
      where: { userId: user.id },
    }))
  ) {
    throw new InvitationServiceError(
      "This user already belongs to an organization.",
      409,
    );
  }

  const role = await getRole(input.roleKey);

  if (!role) {
    throw new InvitationServiceError(
      "Selected role does not exist.",
    );
  }

  const active =
    await Invitation.findOne({
      where: {
        activeKey:
          createInvitationActiveKey(
            auth.organization.id,
            email,
          ),
      },
    });

  if (active) {
    if (
      active.status === "PENDING" &&
      new Date(active.expiresAt).getTime() <=
        Date.now()
    ) {
      await active.update({
        status: "EXPIRED",
        activeKey: null,
      });
    } else {
      throw new InvitationServiceError(
        "This email already has an active invitation.",
        409,
      );
    }
  }

  return {
    auth,
    email,
    name,
    role,
  };
}

export async function createInvitation(
  input: CreateInvitationInput,
) {
  const {
    auth,
    email,
    name,
    role,
  } = await validateCreate(input);

  const {
    token,
    tokenHash,
  } = createInvitationToken();
  const now = new Date();

  const invitation =
    await Invitation.create({
      id: randomUUID(),
      organizationId:
        auth.organization.id,
      invitedByUserId:
        auth.user.id,
      roleId: role.id,
      email,
      name,
      tokenHash,
      activeKey:
        createInvitationActiveKey(
          auth.organization.id,
          email,
        ),
      status: "PENDING",
      expiresAt:
        createInvitationExpiry(now),
      lastSentAt: now,
      sendCount: 1,
    });

  let emailSent = true;

  try {
    await sendInvitationEmail({
      email,
      name,
      organizationName:
        auth.organization.name,
      roleName: role.name,
      token,
    });
  } catch (error) {
    emailSent = false;
    console.error(
      "Invitation email failed:",
      error,
    );
  }

  await createAuditLog({
    action: "INVITATION_CREATED",
    resource: "INVITATION",
    resourceId: invitation.id,
    metadata: {
      email,
      roleKey: input.roleKey,
      emailSent,
    },
  });

  return {
    invitation: serializeInvitation({
      ...invitation.get({ plain: true }),
      role,
      invitedBy: auth.user,
    }),
    emailSent,
  };
}

export async function resendInvitation(
  id: string,
) {
  const auth = await requirePermission(
    "INVITATION_RESEND",
  );
  const invitation: any =
    await getInvitationById(
      id,
      auth.organization.id,
    );

  const status = await expireIfNeeded(
    invitation,
  );

  if (
    !["PENDING", "EXPIRED"].includes(
      status,
    )
  ) {
    throw new InvitationServiceError(
      "Only pending or expired invitations can be resent.",
      409,
    );
  }

  const remaining =
    INVITATION_RESEND_COOLDOWN_SECONDS -
    Math.floor(
      (Date.now() -
        new Date(
          invitation.lastSentAt,
        ).getTime()) /
        1000,
    );

  if (remaining > 0) {
    throw new InvitationServiceError(
      `Please wait ${remaining} seconds before resending.`,
      429,
    );
  }

  const {
    token,
    tokenHash,
  } = createInvitationToken();
  const now = new Date();

  await invitation.update({
    tokenHash,
    activeKey:
      createInvitationActiveKey(
        auth.organization.id,
        invitation.email,
      ),
    status: "PENDING",
    expiresAt:
      createInvitationExpiry(now),
    lastSentAt: now,
    sendCount:
      Number(invitation.sendCount) + 1,
  });

  const role: any = await getRole(
    String(invitation.roleId) as InvitationRoleKey,
  );

  let emailSent = true;

  try {
    await sendInvitationEmail({
      email: invitation.email,
      name: invitation.name,
      organizationName:
        auth.organization.name,
      roleName:
        role?.name ?? "Member",
      token,
    });
  } catch (error) {
    emailSent = false;
    console.error(
      "Invitation resend failed:",
      error,
    );
  }

  await createAuditLog({
    action: "INVITATION_RESENT",
    resource: "INVITATION",
    resourceId: id,
    metadata: { emailSent },
  });

  const fresh: any =
    await getInvitationById(
      id,
      auth.organization.id,
    );

  return {
    invitation: serializeInvitation(
      fresh,
    ),
    emailSent,
  };
}

export async function revokeInvitation(
  id: string,
) {
  const auth = await requirePermission(
    "INVITATION_REVOKE",
  );
  const invitation: any =
    await getInvitationById(
      id,
      auth.organization.id,
    );

  await expireIfNeeded(invitation);

  if (invitation.status !== "PENDING") {
    throw new InvitationServiceError(
      "Only pending invitations can be revoked.",
      409,
    );
  }

  await invitation.update({
    status: "REVOKED",
    activeKey: null,
    revokedAt: new Date(),
  });

  await createAuditLog({
    action: "INVITATION_REVOKED",
    resource: "INVITATION",
    resourceId: id,
  });

  return {
    invitation: serializeInvitation(
      invitation,
    ),
  };
}

export async function getInvitationDetail(
  id: string,
) {
  const auth = await requirePermission(
    "INVITATION_READ",
  );
  const row: any =
    await getInvitationById(
      id,
      auth.organization.id,
    );

  return {
    ...serializeInvitation(row),
    organizationName:
      auth.organization.name,
    acceptedAt: row.acceptedAt
      ? new Date(
          row.acceptedAt,
        ).toISOString()
      : null,
    revokedAt: row.revokedAt
      ? new Date(
          row.revokedAt,
        ).toISOString()
      : null,
  } as InvitationDetail;
}

export async function getPublicInvitation(
  token: string,
): Promise<PublicInvitationData> {
  const row: any =
    await Invitation.findOne({
      where: {
        tokenHash:
          hashInvitationToken(token),
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["key", "name"],
        },
        {
          model: Organization,
          as: "organization",
          attributes: ["name"],
        },
      ],
    });

  const auth = await getCurrentUser();
  const authenticated = Boolean(auth);

  if (!row) {
    return {
      state: "invalid",
      organizationName: null,
      invitedEmail: null,
      invitedName: null,
      roleName: null,
      roleKey: null,
      expiresAt: null,
      existingUser: false,
      authenticated,
    };
  }

  const status = await expireIfNeeded(row);
  const user = await User.findOne({
    where: {
      email: normalizeEmail(row.email),
    },
    attributes: ["id"],
  });

  const base = {
    organizationName:
      row.organization?.name ?? null,
    invitedEmail: row.email,
    invitedName: row.name,
    roleName: row.role?.name ?? null,
    roleKey: row.role?.key ?? null,
    expiresAt: new Date(
      row.expiresAt,
    ).toISOString(),
    existingUser: Boolean(user),
    authenticated,
  };

  if (status === "EXPIRED") {
    return { ...base, state: "expired" };
  }

  if (status === "REVOKED") {
    return { ...base, state: "revoked" };
  }

  if (status === "ACCEPTED") {
    return { ...base, state: "accepted" };
  }

  if (user) {
    const membership =
      await OrganizationMembership.findOne({
        where: { userId: user.id },
        attributes: ["organizationId"],
        raw: true,
      });

    if (membership) {
      if (
        String(membership.organizationId) ===
        String(row.organizationId)
      ) {
        return {
          ...base,
          state: "already-member",
        };
      }

      return {
        ...base,
        state:
          "already-in-another-organization",
      };
    }
  }

  if (
    auth &&
    normalizeEmail(auth.user.email) !==
      normalizeEmail(row.email)
  ) {
    return {
      ...base,
      state: "email-mismatch",
    };
  }

  if (user) {
    return {
      ...base,
      state: "valid-existing-user",
    };
  }

  return {
    ...base,
    state: "valid-new-user",
  };
}

async function loadValidInvitation(
  token: string,
  transaction: Transaction,
) {
  const row: any =
    await Invitation.findOne({
      where: {
        tokenHash:
          hashInvitationToken(token),
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

  if (!row) {
    throw new InvitationServiceError(
      "This invitation link is invalid.",
      404,
    );
  }

  const status = await expireIfNeeded(
    row,
    transaction,
  );

  if (status === "EXPIRED") {
    throw new InvitationServiceError(
      "This invitation has expired.",
      410,
    );
  }

  if (status !== "PENDING") {
    throw new InvitationServiceError(
      `This invitation is ${String(status).toLowerCase()}.`,
      409,
    );
  }

  return row;
}

export async function acceptInvitationForNewUser({
  token,
  name,
  passwordHash,
}: {
  token: string;
  name: string;
  passwordHash: string;
}) {
  return sequelize.transaction(
    async (transaction) => {
      const invitation =
        await loadValidInvitation(
          token,
          transaction,
        );
      const email = normalizeEmail(
        invitation.email,
      );

      const existing =
        await User.findOne({
          where: { email },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

      if (existing) {
        throw new InvitationServiceError(
          "An account already exists for this email. Sign in to accept the invitation instead.",
          409,
        );
      }

      const user = await User.create(
        {
          id: randomUUID(),
          name: name.trim(),
          email,
          passwordHash,
          emailVerified: new Date(),
        },
        { transaction },
      );

      await OrganizationMembership.create(
        {
          id: randomUUID(),
          userId: user.id,
          organizationId:
            invitation.organizationId,
          roleId: invitation.roleId,
        },
        { transaction },
      );

      await invitation.update(
        {
          status: "ACCEPTED",
          activeKey: null,
          acceptedAt: new Date(),
        },
        { transaction },
      );

      await AuditLog.create(
        {
          id: randomUUID(),
          organizationId:
            invitation.organizationId,
          actorUserId: user.id,
          actorName: user.name,
          actorEmail: user.email,
          action: "INVITATION_ACCEPTED",
          resource: "INVITATION",
          resourceId: invitation.id,
          targetUserId: user.id,
          targetUserName: user.name,
          targetUserEmail: user.email,
          metadata: {
            mode: "new-user",
          },
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
        },
        { transaction },
      );

      return {
        userId: user.id,
        invitationId: invitation.id,
      };
    },
  );
}

export async function acceptInvitationForExistingUser(
  token: string,
) {
  const auth = await getCurrentUser();

  if (!auth) {
    throw new InvitationServiceError(
      "Sign in before accepting this invitation.",
      401,
    );
  }

  return sequelize.transaction(
    async (transaction) => {
      const invitation =
        await loadValidInvitation(
          token,
          transaction,
        );

      if (
        normalizeEmail(auth.user.email) !==
        normalizeEmail(invitation.email)
      ) {
        throw new InvitationServiceError(
          "This invitation belongs to a different email address.",
          403,
        );
      }

      const membership =
        await OrganizationMembership.findOne({
          where: { userId: auth.user.id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

      if (membership) {
        if (
          String(membership.organizationId) ===
          String(invitation.organizationId)
        ) {
          await invitation.update(
            {
              status: "ACCEPTED",
              activeKey: null,
              acceptedAt: new Date(),
            },
            { transaction },
          );

          return {
            invitationId: invitation.id,
            alreadyMember: true,
          };
        }

        throw new InvitationServiceError(
          "Your account already belongs to another organization.",
          409,
        );
      }

      await OrganizationMembership.create(
        {
          id: randomUUID(),
          userId: auth.user.id,
          organizationId:
            invitation.organizationId,
          roleId: invitation.roleId,
        },
        { transaction },
      );

      await invitation.update(
        {
          status: "ACCEPTED",
          activeKey: null,
          acceptedAt: new Date(),
        },
        { transaction },
      );

      await AuditLog.create(
        {
          id: randomUUID(),
          organizationId:
            invitation.organizationId,
          actorUserId: auth.user.id,
          actorName: auth.user.name,
          actorEmail: auth.user.email,
          action: "INVITATION_ACCEPTED",
          resource: "INVITATION",
          resourceId: invitation.id,
          targetUserId: auth.user.id,
          targetUserName: auth.user.name,
          targetUserEmail: auth.user.email,
          metadata: {
            mode: "existing-user",
          },
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
        },
        { transaction },
      );

      return {
        invitationId: invitation.id,
        alreadyMember: false,
      };
    },
  );
}

export async function importInvitations(
  inputs: ImportInvitationInput[],
) {
  await requirePermission(
    "INVITATION_IMPORT",
  );

  if (!inputs.length) {
    throw new InvitationServiceError(
      "No invitations were supplied.",
    );
  }

  if (
    inputs.length >
    INVITATION_MAX_IMPORT_ROWS
  ) {
    throw new InvitationServiceError(
      `A maximum of ${INVITATION_MAX_IMPORT_ROWS} invitations can be imported at once.`,
    );
  }

  const created: InvitationListItem[] = [];
  const failedEmails: string[] = [];
  const skipped: {
    email: string;
    reason: string;
  }[] = [];
  const seen = new Set<string>();

  for (const input of inputs) {
    const email = normalizeEmail(input.email);

    if (seen.has(email)) {
      skipped.push({
        email,
        reason:
          "This email appears more than once in the import.",
      });
      continue;
    }

    seen.add(email);

    try {
      created.push(
        (
          await createInvitation(input)
        ).invitation,
      );
    } catch (error) {
      skipped.push({
        email,
        reason:
          error instanceof Error
            ? error.message
            : "Unable to create this invitation.",
      });
    }
  }

  if (created.length) {
    await createAuditLog({
      action: "INVITATION_BULK_IMPORTED",
      resource: "INVITATION",
      metadata: {
        createdCount: created.length,
        skippedCount: skipped.length,
      },
    });
  }

  return {
    created,
    createdCount: created.length,
    sentCount:
      created.length - failedEmails.length,
    failedEmails,
    skipped,
  };
}
