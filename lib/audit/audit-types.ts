import type { Transaction } from "sequelize";

export const AUDIT_RESOURCES = [
  "AUTH",
  "USER",
  "INVITATION",
  "DOCUMENT",
  "ROLE",
  "ORGANIZATION",
  "AUDIT_LOG",
] as const;

export type AuditResource =
  (typeof AUDIT_RESOURCES)[number];

export type JsonPrimitive =
  | string
  | number
  | boolean
  | null;

export type JsonValue =
  | JsonPrimitive
  | JsonObject
  | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type AuditActorOption = {
  id: string;
  name: string;
  email: string;
};

export type AuditChange = {
  label: string;
  from: string;
  to: string;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  actionLabel: string;
  actionDescription: string;

  resource: AuditResource;
  resourceLabel: string;
  resourceId: string | null;

  actor: {
    id: string;
    name: string;
    email: string;
  };

  target: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;

  change: AuditChange | null;

  metadata: JsonObject | null;
  ipAddress: string | null;
  userAgent: string | null;

  createdAt: string;
};

export type AuditLogFilters = {
  search: string;
  action: string;
  resource: string;
  actorUserId: string;
  from: string;
  to: string;
};

export type AuditLogDirectoryData = {
  logs: AuditLogEntry[];

  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  stats: {
    totalEvents: number;
    last24Hours: number;
    last7Days: number;
    uniqueActors: number;
  };

  actors: AuditActorOption[];
  filters: AuditLogFilters;
};

export type CreateAuditLogInput = {
  action: string;
  resource: AuditResource;
  resourceId?: string | null;
  targetUserId?: string | null;
  metadata?: JsonObject | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  transaction?: Transaction;
};

export type AuditLogQuery = {
  search?: string;
  action?: string;
  resource?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};