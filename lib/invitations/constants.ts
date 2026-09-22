export const INVITATION_TTL_DAYS = 7;

export const INVITATION_RESEND_COOLDOWN_SECONDS = 60;

export const INVITATION_MAX_IMPORT_ROWS = 100;

export const INVITATION_MAX_FILE_SIZE =
  2 * 1024 * 1024;

export const INVITATION_PAGE_SIZE = 20;

export const INVITATION_MAX_PAGE_SIZE = 100;

export const INVITATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REVOKED",
] as const;

export type InvitationStatus =
  (typeof INVITATION_STATUSES)[number];

export const INVITATION_ROLE_KEYS = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MEMBER",
] as const;

export type InvitationRoleKey =
  (typeof INVITATION_ROLE_KEYS)[number];

export const ROLE_LABELS: Record<
  InvitationRoleKey,
  string
> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  MEMBER: "Member",
};

export const ROLE_DESCRIPTIONS: Record<
  InvitationRoleKey,
  string
> = {
  OWNER:
    "Full organization control, including member and billing management.",

  ADMIN:
    "Manage users, invitations, settings, and organization operations.",

  MANAGER:
    "Manage members and day-to-day team administration.",

  MEMBER:
    "Access the organization according to assigned member permissions.",
};

export const STATUS_LABELS: Record<
  InvitationStatus,
  string
> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};