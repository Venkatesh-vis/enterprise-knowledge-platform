import "server-only";

import { Op } from "sequelize";
import { randomUUID } from "crypto";

import AuditLog from "@/db/models/audit-log";
import User from "@/db/models/user";
import { requirePermission } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/get-current-user";

import {
  AUDIT_ACTION_META,
  isAuditAction,
  isAuditResource,
  getAuditActionMeta,
} from "./audit-actions";

import {
  getAuditRequestMetadata,
  sanitizeAuditMetadata,
} from "./audit-helpers";

import type {
  AuditActorOption,
  AuditChange,
  AuditLogDirectoryData,
  AuditLogEntry,
  AuditLogFilters,
  AuditLogQuery,
  CreateAuditLogInput,
  JsonObject,
} from "./audit-types";

const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 100;
const MAX_ACTOR_OPTIONS = 200;

export class AuditLogServiceError extends Error {
  status: 400 | 500;

  constructor(
    message: string,
    status: 400 | 500 = 500,
  ) {
    super(message);

    this.name = "AuditLogServiceError";
    this.status = status;
  }
}

function getRoleLabel(value: unknown) {
  const role = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (role) {
    case "OWNER":
      return "Owner";

    case "ADMIN":
      return "Administrator";

    case "MANAGER":
      return "Manager";

    case "MEMBER":
      return "Member";

    default:
      return role
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (character) =>
          character.toUpperCase(),
        );
  }
}

function getTargetDisplayName(
  row: Record<string, any>,
) {
  return (
    row.targetUserName ??
    row.targetUserEmail ??
    "this user"
  );
}

function buildActivityDescription(
  action: string,
  row: Record<string, any>,
) {
  const actorName =
    String(row.actorName ?? "Someone");

  const targetName =
    getTargetDisplayName(row);

  const metadata =
    row.metadata &&
    typeof row.metadata === "object" &&
    !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};

  switch (action) {
    case "USER_ROLE_CHANGED": {
      const oldRole = getRoleLabel(
        metadata.oldRoleKey,
      );

      const newRole = getRoleLabel(
        metadata.newRoleKey,
      );

      return `${actorName} changed ${targetName}'s role from ${oldRole} to ${newRole}.`;
    }

    case "USER_REMOVED":
      return `${actorName} removed ${targetName} from the organization.`;

    case "USER_CREATED":
      return `${actorName} created ${targetName}'s account.`;

    case "INVITATION_CREATED":
      return `${actorName} sent an organization invitation.`;

    case "INVITATION_RESENT":
      return `${actorName} resent an organization invitation.`;

    case "INVITATION_REVOKED":
      return `${actorName} revoked an organization invitation.`;

    case "INVITATION_BULK_IMPORTED":
      return `${actorName} imported invitations in bulk.`;

    case "DOCUMENT_CREATED":
      return `${actorName} created a document.`;

    case "DOCUMENT_UPDATED":
      return `${actorName} updated a document.`;

    case "DOCUMENT_DELETED":
      return `${actorName} deleted a document.`;

    case "DOCUMENT_SHARED":
      return `${actorName} changed document access.`;

    case "ROLE_PERMISSION_CHANGED":
      return `${actorName} changed role permissions.`;

    case "ORGANIZATION_SETTING_UPDATED":
      return `${actorName} updated an organization setting.`;

    case "AUTH_LOGIN":
      return `${actorName} signed in.`;

    case "AUTH_LOGOUT":
      return `${actorName} signed out.`;

    default:
      return `${actorName} performed an organization activity.`;
  }
}

function buildAuditChange(
  action: string,
  metadata: unknown,
): AuditChange | null {
  if (
    !metadata ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return null;
  }

  const values =
    metadata as Record<string, unknown>;

  switch (action) {
    case "USER_ROLE_CHANGED":
      return {
        label: "Role",
        from: getRoleLabel(
          values.oldRoleKey,
        ),
        to: getRoleLabel(
          values.newRoleKey,
        ),
      };

    default:
      return null;
  }
}

async function createTargetSnapshot(
  targetUserId: string,
  transaction?: CreateAuditLogInput["transaction"],
) {
  const targetUser =
    await User.findByPk(targetUserId, {
      attributes: [
        "id",
        "name",
        "email",
      ],
      raw: true,
      transaction,
    });

  return {
    id: targetUser?.id
      ? String(targetUser.id)
      : String(targetUserId),

    name:
      targetUser?.name
        ? String(targetUser.name)
        : null,

    email:
      targetUser?.email
        ? String(targetUser.email)
        : null,
  };
}

function normalizeMetadata(
  metadata: unknown,
): JsonObject | null {
  if (
    !metadata ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return null;
  }

  return metadata as JsonObject;
}

function serializeAuditLog(
  row: Record<string, any>,
): AuditLogEntry {
  const action =
    String(row.action ?? "");

  const resource =
    String(row.resource ?? "AUDIT_LOG");

  const actionMeta =
    getAuditActionMeta(
      action,
      resource,
    );

  const metadata =
    normalizeMetadata(
      row.metadata,
    );

  return {
    id: String(row.id),

    action,

    actionLabel:
      actionMeta.label,

    actionDescription:
      buildActivityDescription(
        action,
        row,
      ),

    resource:
      actionMeta.resource,

    resourceLabel:
      actionMeta.resourceLabel,

    resourceId:
      row.resourceId === null ||
      row.resourceId === undefined
        ? null
        : String(row.resourceId),

    actor: {
      id: String(row.actorUserId),

      name:
        String(row.actorName ?? ""),

      email:
        String(row.actorEmail ?? ""),
    },

    target:
      row.targetUserId
        ? {
            id: String(
              row.targetUserId,
            ),

            name:
              row.targetUserName === null ||
              row.targetUserName === undefined
                ? null
                : String(
                    row.targetUserName,
                  ),

            email:
              row.targetUserEmail === null ||
              row.targetUserEmail === undefined
                ? null
                : String(
                    row.targetUserEmail,
                  ),
          }
        : null,

    change:
      buildAuditChange(
        action,
        metadata,
      ),

    metadata,

    ipAddress:
      row.ipAddress === null ||
      row.ipAddress === undefined
        ? null
        : String(row.ipAddress),

    userAgent:
      row.userAgent === null ||
      row.userAgent === undefined
        ? null
        : String(row.userAgent),

    createdAt:
      new Date(
        row.createdAt,
      ).toISOString(),
  };
}

export async function createAuditLog({
  action,
  resource,
  resourceId = null,
  targetUserId = null,
  metadata = null,
  ipAddress,
  userAgent,
  transaction,
}: CreateAuditLogInput): Promise<AuditLogEntry> {
  if (!isAuditAction(action)) {
    throw new AuditLogServiceError(
      `Unsupported audit action: ${action}.`,
      400,
    );
  }

  const actionMeta =
    AUDIT_ACTION_META[action];

  if (actionMeta.resource !== resource) {
    throw new AuditLogServiceError(
      `Audit action ${action} does not belong to resource ${resource}.`,
      400,
    );
  }

  const auth =
    await getCurrentUser();

  if (!auth) {
    throw new AuditLogServiceError(
      "Authenticated user could not be resolved while recording audit history.",
      500,
    );
  }

  let requestMetadata = {
    ipAddress:
      ipAddress ?? null,

    userAgent:
      userAgent ?? null,
  };

  if (
    ipAddress === undefined ||
    userAgent === undefined
  ) {
    try {
      const detected =
        await getAuditRequestMetadata();

      requestMetadata = {
        ipAddress:
          ipAddress ??
          detected.ipAddress,

        userAgent:
          userAgent ??
          detected.userAgent,
      };
    } catch {
      // Request metadata is optional.
    }
  }

  const targetSnapshot =
    targetUserId
      ? await createTargetSnapshot(
          targetUserId,
          transaction,
        )
      : null;

  const row =
    await AuditLog.create(
      {
        id: randomUUID(),

        organizationId:
          auth.organization.id,

        actorUserId:
          auth.user.id,

        actorName:
          auth.user.name,

        actorEmail:
          auth.user.email,

        action,

        resource,

        resourceId:
          resourceId
            ? String(
                resourceId,
              ).slice(0, 191)
            : null,

        targetUserId:
          targetSnapshot?.id ??
          null,

        targetUserName:
          targetSnapshot?.name ??
          null,

        targetUserEmail:
          targetSnapshot?.email ??
          null,

        metadata:
          sanitizeAuditMetadata(
            metadata,
          ),

        ipAddress:
          requestMetadata.ipAddress,

        userAgent:
          requestMetadata.userAgent,

        createdAt:
          new Date(),
      },
      {
        transaction,
      },
    );

  return serializeAuditLog(
    row.get({
      plain: true,
    }) as Record<
      string,
      any
    >,
  );
}

function escapeLike(
  value: string,
) {
  return value.replace(
    /[\\%_]/g,
    "\\$&",
  );
}

function normalizePage(
  value: number | undefined,
) {
  if (
    !Number.isInteger(value) ||
    (value ?? 1) < 1
  ) {
    return 1;
  }

  return value as number;
}

function normalizePageSize(
  value: number | undefined,
) {
  if (
    !Number.isInteger(value) ||
    (value ?? 25) < 1
  ) {
    return 25;
  }

  return Math.min(
    value as number,
    MAX_PAGE_SIZE,
  );
}

function parseDate(
  value: string,
  label: string,
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    throw new AuditLogServiceError(
      `${label} must use YYYY-MM-DD format.`,
      400,
    );
  }

  const date =
    new Date(
      `${value}T00:00:00.000Z`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    ) ||
    date
      .toISOString()
      .slice(0, 10) !== value
  ) {
    throw new AuditLogServiceError(
      `${label} is not a valid calendar date.`,
      400,
    );
  }

  return date;
}

function buildDateRange(
  from?: string,
  to?: string,
) {
  const where: Record<
    string,
    unknown
  > = {};

  const fromDate =
    from
      ? parseDate(
          from,
          "Start date",
        )
      : null;

  const toDate =
    to
      ? parseDate(
          to,
          "End date",
        )
      : null;

  if (
    fromDate &&
    toDate &&
    fromDate > toDate
  ) {
    throw new AuditLogServiceError(
      "The start date cannot be after the end date.",
      400,
    );
  }

  if (
    fromDate &&
    toDate
  ) {
    const endExclusive =
      new Date(
        toDate.getTime() +
          24 *
            60 *
            60 *
            1_000,
      );

    where.createdAt = {
      [Op.gte]:
        fromDate,

      [Op.lt]:
        endExclusive,
    };
  } else if (fromDate) {
    where.createdAt = {
      [Op.gte]:
        fromDate,
    };
  } else if (toDate) {
    const endExclusive =
      new Date(
        toDate.getTime() +
          24 *
            60 *
            60 *
            1_000,
      );

    where.createdAt = {
      [Op.lt]:
        endExclusive,
    };
  }

  return where;
}

function buildFilteredWhere(
  organizationId: string,
  query: AuditLogQuery,
) {
  const where: Record<
    string,
    any
  > = {
    organizationId,
  };

  if (query.action) {
    if (
      !isAuditAction(
        query.action,
      )
    ) {
      throw new AuditLogServiceError(
        "The selected activity is invalid.",
        400,
      );
    }

    where.action =
      query.action;
  }

  if (query.resource) {
    if (
      !isAuditResource(
        query.resource,
      )
    ) {
      throw new AuditLogServiceError(
        "The selected resource is invalid.",
        400,
      );
    }

    where.resource =
      query.resource;
  }

  if (query.actorUserId) {
    where.actorUserId =
      query.actorUserId.slice(
        0,
        191,
      );
  }

  Object.assign(
    where,
    buildDateRange(
      query.from,
      query.to,
    ),
  );

  const search =
    query.search
      ?.trim()
      .slice(
        0,
        MAX_SEARCH_LENGTH,
      ) ?? "";

  if (search) {
    const pattern =
      `%${escapeLike(
        search,
      )}%`;

    where[Op.or] = [
      {
        actorName: {
          [Op.like]:
            pattern,
        },
      },
      {
        actorEmail: {
          [Op.like]:
            pattern,
        },
      },
      {
        targetUserName: {
          [Op.like]:
            pattern,
        },
      },
      {
        targetUserEmail: {
          [Op.like]:
            pattern,
        },
      },
      {
        action: {
          [Op.like]:
            pattern,
        },
      },
      {
        resource: {
          [Op.like]:
            pattern,
        },
      },
      {
        resourceId: {
          [Op.like]:
            pattern,
        },
      },
    ];
  }

  return where;
}

export async function getAuditLogDirectoryData(
  query: AuditLogQuery = {},
): Promise<AuditLogDirectoryData> {
  const actor =
    await requirePermission(
      "AUDIT_LOG_READ",
    );

  const pageSize =
    normalizePageSize(
      query.pageSize,
    );

  const requestedPage =
    normalizePage(
      query.page,
    );

  const filters:
    AuditLogFilters = {
      search:
        query.search
          ?.trim()
          .slice(
            0,
            MAX_SEARCH_LENGTH,
          ) ?? "",

      action:
        query.action ?? "",

      resource:
        query.resource ?? "",

      actorUserId:
        query.actorUserId ?? "",

      from:
        query.from ?? "",

      to:
        query.to ?? "",
    };

  const filteredWhere =
    buildFilteredWhere(
      actor.organization.id,
      filters,
    );

  const organizationWhere =
    {
      organizationId:
        actor.organization.id,
    };

  const [
    totalItems,
    rows,
    totalEvents,
    last24Hours,
    last7Days,
    uniqueActors,
    actorRows,
  ] = await Promise.all([
    AuditLog.count({
      where:
        filteredWhere,
    }),

    AuditLog.findAll({
      where:
        filteredWhere,

      attributes: [
        "id",
        "organizationId",
        "actorUserId",
        "actorName",
        "actorEmail",
        "action",
        "resource",
        "resourceId",
        "targetUserId",
        "targetUserName",
        "targetUserEmail",
        "metadata",
        "ipAddress",
        "userAgent",
        "createdAt",
      ],

      order: [
        [
          "createdAt",
          "DESC",
        ],
        [
          "id",
          "DESC",
        ],
      ],

      limit:
        pageSize,

      offset:
        (requestedPage - 1) *
        pageSize,

      raw: true,
    }),

    AuditLog.count({
      where:
        organizationWhere,
    }),

    AuditLog.count({
      where: {
        organizationId:
          actor.organization.id,

        createdAt: {
          [Op.gte]:
            new Date(
              Date.now() -
                24 *
                  60 *
                  60 *
                  1_000,
            ),
        },
      },
    }),

    AuditLog.count({
      where: {
        organizationId:
          actor.organization.id,

        createdAt: {
          [Op.gte]:
            new Date(
              Date.now() -
                7 *
                  24 *
                  60 *
                  60 *
                  1_000,
            ),
        },
      },
    }),

    AuditLog.count({
      where:
        organizationWhere,

      distinct: true,

      col:
        "actorUserId",
    }),

    AuditLog.findAll({
      where:
        organizationWhere,

      attributes: [
        "actorUserId",
        "actorName",
        "actorEmail",
      ],

      group: [
        "actorUserId",
        "actorName",
        "actorEmail",
      ],

      order: [
        [
          "actorName",
          "ASC",
        ],
        [
          "actorEmail",
          "ASC",
        ],
      ],

      limit:
        MAX_ACTOR_OPTIONS,

      raw: true,
    }),
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
          pageSize,
      ),
    );

  const currentPage =
    Math.min(
      requestedPage,
      totalPages,
    );

  let pageRows =
    rows as Array<
      Record<string, any>
    >;

  if (
    requestedPage !==
    currentPage
  ) {
    pageRows =
      (await AuditLog.findAll(
        {
          where:
            filteredWhere,

          attributes: [
            "id",
            "organizationId",
            "actorUserId",
            "actorName",
            "actorEmail",
            "action",
            "resource",
            "resourceId",
            "targetUserId",
            "targetUserName",
            "targetUserEmail",
            "metadata",
            "ipAddress",
            "userAgent",
            "createdAt",
          ],

          order: [
            [
              "createdAt",
              "DESC",
            ],
            [
              "id",
              "DESC",
            ],
          ],

          limit:
            pageSize,

          offset:
            (currentPage - 1) *
            pageSize,

          raw: true,
        },
      )) as Array<
        Record<string, any>
      >;
  }

  const actors:
    AuditActorOption[] =
      (
        actorRows as Array<
          Record<string, any>
        >
      ).map(
        (row) => ({
          id: String(
            row.actorUserId,
          ),

          name: String(
            row.actorName,
          ),

          email: String(
            row.actorEmail,
          ),
        }),
      );

  return {
    logs:
      pageRows.map(
        (row) =>
          serializeAuditLog(
            row,
          ),
      ),

    pagination: {
      page:
        currentPage,

      pageSize,

      totalItems,

      totalPages,
    },

    stats: {
      totalEvents,

      last24Hours,

      last7Days,

      uniqueActors,
    },

    actors,

    filters,
  };
}

export async function getAuditLogById(
  auditLogId: string,
): Promise<AuditLogEntry | null> {
  const actor =
    await requirePermission(
      "AUDIT_LOG_READ",
    );

  if (
    !auditLogId?.trim()
  ) {
    throw new AuditLogServiceError(
      "Audit log ID is required.",
      400,
    );
  }

  const row =
    await AuditLog.findOne({
      where: {
        id:
          auditLogId,

        organizationId:
          actor.organization.id,
      },

      attributes: [
        "id",
        "organizationId",
        "actorUserId",
        "actorName",
        "actorEmail",
        "action",
        "resource",
        "resourceId",
        "targetUserId",
        "targetUserName",
        "targetUserEmail",
        "metadata",
        "ipAddress",
        "userAgent",
        "createdAt",
      ],

      raw: true,
    });

  return row
    ? serializeAuditLog(
        row as Record<
          string,
          any
        >,
      )
    : null;
}