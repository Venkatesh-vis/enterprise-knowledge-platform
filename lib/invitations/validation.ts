import { z } from "zod";

import {
  INVITATION_MAX_IMPORT_ROWS,
  INVITATION_ROLE_KEYS,
  INVITATION_STATUSES,
} from "./constants";

import type {
  ImportInvitationInput,
  ImportInvitationRowError,
  ImportInvitationValidationResult,
  InvitationCsvPreviewRow,
  InvitationRoleKey,
} from "./types";

import {
  isValidEmail,
  normalizeEmail,
  parseCsv,
} from "./utils";

const roleEnum = z.enum(
  INVITATION_ROLE_KEYS,
);

const statusEnum = z.enum(
  INVITATION_STATUSES,
);

export const createInvitationSchema =
  z.object({
    email: z
      .string()
      .trim()
      .min(
        1,
        "Email is required.",
      )
      .max(
        255,
        "Email must be 255 characters or less.",
      )
      .email(
        "Enter a valid email address.",
      ),

    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters.",
      )
      .max(
        100,
        "Name must be 100 characters or less.",
      ),

    roleKey: roleEnum,
  });

export const importInvitationSchema =
  z
    .array(createInvitationSchema)
    .min(1)
    .max(INVITATION_MAX_IMPORT_ROWS);

export const acceptInvitationSchema =
  z.object({
    token: z
      .string()
      .regex(
        /^[a-f0-9]{64}$/,
        "Invalid invitation token.",
      ),

    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters.",
      )
      .max(
        100,
        "Name must be 100 characters or less.",
      ),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters.",
      )
      .max(
        128,
        "Password must be 128 characters or less.",
      ),
  });

export const acceptExistingInvitationSchema =
  z.object({
    token: z
      .string()
      .regex(
        /^[a-f0-9]{64}$/,
        "Invalid invitation token.",
      ),
  });

export const invitationListQuerySchema =
  z.object({
    q: z
      .string()
      .trim()
      .max(100)
      .default(""),

    status: z
      .union([
        z.literal("ALL"),
        statusEnum,
      ])
      .default("ALL"),

    role: z
      .union([
        z.literal("ALL"),
        roleEnum,
      ])
      .default("ALL"),

    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),
  });

export function validateInvitationRows(
  rows: ImportInvitationInput[],
) {
  const result =
    importInvitationSchema.parse(
      rows,
    );

  return result.map((row) => ({
    ...row,

    email: normalizeEmail(
      row.email,
    ),

    name: row.name.trim(),
  }));
}

export function validateInvitationCsv(
  text: string,
  actorRole: string,
  existingEmails: string[] = [],
): ImportInvitationValidationResult {
  const parsed = parseCsv(text);

  const rows: InvitationCsvPreviewRow[] =
    [];

  const valid: ImportInvitationInput[] =
    [];

  const invalid: ImportInvitationRowError[] =
    [];

  if (parsed.length === 0) {
    return {
      valid: [],

      invalid: [
        {
          line: 1,
          values: [],
          reason:
            "The CSV file is empty.",
        },
      ],

      rows: [],
    };
  }

  const expectedHeader = [
    "email",
    "name",
    "role",
  ];

  const header = parsed[0].map(
    (value) =>
      value
        .trim()
        .toLowerCase(),
  );

  const validHeader =
    header.length ===
      expectedHeader.length &&
    header.every(
      (value, index) =>
        value === expectedHeader[index],
    );

  if (!validHeader) {
    return {
      valid: [],

      invalid: [
        {
          line: 1,
          values: parsed[0],
          reason:
            "Header must be exactly: email,name,role.",
        },
      ],

      rows: [],
    };
  }

  const dataRows =
    parsed.slice(1);

  if (dataRows.length === 0) {
    return {
      valid: [],

      invalid: [
        {
          line: 2,
          values: [],
          reason:
            "Add at least one invitation row.",
        },
      ],

      rows: [],
    };
  }

  if (
    dataRows.length >
    INVITATION_MAX_IMPORT_ROWS
  ) {
    return {
      valid: [],

      invalid: [
        {
          line: 2,
          values: [],
          reason:
            `A maximum of ` +
            `${INVITATION_MAX_IMPORT_ROWS} ` +
            `invitations can be imported at once.`,
        },
      ],

      rows: [],
    };
  }

  const existing = new Set(
    existingEmails.map(
      normalizeEmail,
    ),
  );

  const seen =
    new Set<string>();

  dataRows.forEach(
    (values, index) => {
      const line = index + 2;

      const email =
        (values[0] ?? "").trim();

      const name =
        (values[1] ?? "").trim();

      const role =
        (values[2] ?? "")
          .trim()
          .toUpperCase();

      let reason =
        "Ready to import";

      let validRow = true;

      if (values.length !== 3) {
        validRow = false;
        reason =
          "Each row must contain exactly 3 columns.";
      } else if (!email) {
        validRow = false;
        reason =
          "Email is required.";
      } else if (
        !isValidEmail(email)
      ) {
        validRow = false;
        reason =
          "Enter a valid email address.";
      } else if (!name) {
        validRow = false;
        reason =
          "Name is required.";
      } else if (
        name.length > 100
      ) {
        validRow = false;
        reason =
          "Name must be 100 characters or less.";
      } else if (!role) {
        validRow = false;
        reason =
          "Role is required.";
      } else if (
        !roleEnum.safeParse(role)
          .success
      ) {
        validRow = false;
        reason =
          "Role must be Owner, Administrator, Manager, or Member.";
      } else if (
        !canInviteRole(
          actorRole,
          role as InvitationRoleKey,
        )
      ) {
        validRow = false;
        reason =
          "You cannot assign this role.";
      } else if (
        existing.has(
          normalizeEmail(email),
        )
      ) {
        validRow = false;
        reason =
          "An account or invitation already uses this email.";
      } else if (
        seen.has(
          normalizeEmail(email),
        )
      ) {
        validRow = false;
        reason =
          "This email appears more than once in the file.";
      }

      if (validRow) {
        seen.add(
          normalizeEmail(email),
        );

        valid.push({
          email: normalizeEmail(
            email,
          ),
          name,
          roleKey:
            role as InvitationRoleKey,
        });
      } else {
        invalid.push({
          line,
          values,
          reason,
        });
      }

      rows.push({
        line,
        email,
        name,
        role,
        valid: validRow,
        reason,
      });
    },
  );

  return {
    valid,
    invalid,
    rows,
  };
}

export function canInviteRole(
  actorRole: string,
  targetRole: InvitationRoleKey,
) {
  if (
    targetRole === "OWNER"
  ) {
    return actorRole === "OWNER";
  }

  if (
    actorRole === "OWNER"
  ) {
    return true;
  }

  if (
    actorRole === "ADMIN"
  ) {
    return [
      "ADMIN",
      "MANAGER",
      "MEMBER",
    ].includes(targetRole);
  }

  if (
    actorRole === "MANAGER"
  ) {
    return targetRole === "MEMBER";
  }

  return false;
}