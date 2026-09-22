export type {
  InvitationRoleKey,
  InvitationStatus,
} from "./constants";

import type {
  InvitationRoleKey,
  InvitationStatus,
} from "./constants";

export type InvitationState =
  | "valid-new-user"
  | "valid-existing-user"
  | "accepted"
  | "expired"
  | "revoked"
  | "invalid"
  | "already-member"
  | "already-in-another-organization"
  | "email-mismatch"
  | "error";

export type InvitationListItem = {
  id: string;

  email: string;

  name: string | null;

  roleKey: InvitationRoleKey;

  roleName: string;

  status: InvitationStatus;

  createdAt: string;

  expiresAt: string;

  lastSentAt: string;

  invitedByName: string;

  sendCount: number;
};

export type InvitationDetail =
  InvitationListItem & {
    organizationName: string;

    acceptedAt: string | null;

    revokedAt: string | null;
  };

export type InvitationStats = {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  revoked: number;
};

export type InvitationRoleOption = {
  value: InvitationRoleKey;
  label: string;
  description: string;
};

export type InvitationPageData = {
  organization: {
    id: string;
    name: string;
  };

  invitations: InvitationListItem[];

  stats: InvitationStats;

  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  filters: {
    query: string;
    status: InvitationStatus | "ALL";
    role: InvitationRoleKey | "ALL";
  };

  roles: InvitationRoleOption[];

  allowedRoleKeys: InvitationRoleKey[];

  currentRole: InvitationRoleKey;

  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canImport: boolean;
    canResend: boolean;
    canRevoke: boolean;
  };
};

export type PublicInvitationData = {
  state: InvitationState;

  organizationName: string | null;

  invitedEmail: string | null;

  invitedName: string | null;

  roleName: string | null;

  roleKey: InvitationRoleKey | null;

  expiresAt: string | null;

  existingUser: boolean;

  authenticated: boolean;
};

export type CreateInvitationInput = {
  email: string;
  name: string;
  roleKey: InvitationRoleKey;
};

export type ImportInvitationInput =
  CreateInvitationInput;

export type InvitationCsvPreviewRow = {
  line: number;
  email: string;
  name: string;
  role: string;
  valid: boolean;
  reason: string;
};

export type ImportInvitationRowError = {
  line: number;
  values: string[];
  reason: string;
};

export type ImportInvitationValidationResult = {
  valid: ImportInvitationInput[];

  invalid: ImportInvitationRowError[];

  rows: InvitationCsvPreviewRow[];
};

export type InvitationAction =
  | "RESEND"
  | "REVOKE";