import type {
  InvitationRoleKey,
  InvitationStatus,
  ImportInvitationInput,
  ImportInvitationRowError,
  ImportInvitationValidationResult,
} from "./types";

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
    "Full organization control, including user and organization management.",

  ADMIN:
    "Manage members, invitations, documents, and operational settings.",

  MANAGER:
    "Manage assigned members and day-to-day workspace activities.",

  MEMBER:
    "Access organization resources according to assigned permissions.",
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

export const INVITATION_TEMPLATE_COLUMNS = [
  "email",
  "name",
  "role",
] as const;

export const MAX_IMPORT_ROWS = 100;

export const MAX_IMPORT_FILE_SIZE =
  2 * 1024 * 1024;

const ROLE_KEYS = new Set<
  InvitationRoleKey
>([
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MEMBER",
]);

export function getRoleLabel(
  roleKey: InvitationRoleKey,
) {
  return ROLE_LABELS[roleKey];
}

export function getInvitableRoleKeys(
  actorRole: InvitationRoleKey,
): InvitationRoleKey[] {
  switch (actorRole) {
    case "OWNER":
      return [
        "OWNER",
        "ADMIN",
        "MANAGER",
        "MEMBER",
      ];

    case "ADMIN":
      return [
        "ADMIN",
        "MANAGER",
        "MEMBER",
      ];

    case "MANAGER":
      return ["MEMBER"];

    case "MEMBER":
      return [];

    default:
      return [];
  }
}

export function getRoleDescription(
  roleKey: InvitationRoleKey,
) {
  return ROLE_DESCRIPTIONS[roleKey];
}

export function getRoleOptions(
  actorRole: InvitationRoleKey,
) {
  return getInvitableRoleKeys(
    actorRole,
  ).map((roleKey) => ({
    value: roleKey,
    label: ROLE_LABELS[roleKey],
  }));
}

export function getStatusLabel(
  status: InvitationStatus,
) {
  return STATUS_LABELS[status];
}

export function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

export function formatDateTime(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

export function formatExpiry(
  value: string,
) {
  const expiry = new Date(value);

  if (Number.isNaN(expiry.getTime())) {
    return "Unknown expiry";
  }

  const diff =
    expiry.getTime() -
    Date.now();

  if (diff <= 0) {
    return "Expired";
  }

  const totalHours =
    Math.floor(
      diff / (1000 * 60 * 60),
    );

  if (totalHours < 24) {
    return `${Math.max(
      totalHours,
      1,
    )}h left`;
  }

  const days = Math.floor(
    totalHours / 24,
  );

  return `${days}d left`;
}

export function getInitials(
  name: string | null,
  email: string,
) {
  const source =
    name?.trim() || email;

  const parts = source
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts.at(-1)?.[0] ?? ""
  }`.toUpperCase();
}

export function normalizeEmail(
  email: string,
) {
  return email
    .trim()
    .toLowerCase();
}

export function isValidEmail(
  email: string,
) {
  const normalized =
    normalizeEmail(email);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalized,
  );
}

export function createDummyInvitationId() {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `inv-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function addDays(
  date: Date,
  days: number,
) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() + days,
  );

  return result;
}

/**
 * Download the exact CSV structure
 * expected by the bulk invitation importer.
 *
 * Required columns:
 * email,name,role
 */
export function downloadInvitationTemplate() {
  const header =
    INVITATION_TEMPLATE_COLUMNS.join(
      ",",
    );

  const csv =
    `${header}\r\n`;

  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement(
      "a",
    );

  anchor.href = url;

  anchor.download =
    "invitation-template.csv";

  document.body.appendChild(
    anchor,
  );

  anchor.click();

  document.body.removeChild(
    anchor,
  );

  URL.revokeObjectURL(url);
}

/**
 * Parse a CSV document while supporting
 * quoted values and escaped quotes.
 *
 * Example:
 *
 * email,name,role
 * john@example.com,John Doe,MEMBER
 * jane@example.com,"Jane, Smith",MANAGER
 */
export function parseCsv(
  text: string,
): string[][] {
  const rows: string[][] =
    [];

  let currentRow: string[] =
    [];

  let currentValue = "";

  let insideQuotes = false;

  const normalizedText =
    text.replace(
      /^\uFEFF/,
      "",
    );

  for (
    let index = 0;
    index <
    normalizedText.length;
    index += 1
  ) {
    const character =
      normalizedText[index];

    if (
      character === '"'
    ) {
      if (
        insideQuotes &&
        normalizedText[
          index + 1
        ] === '"'
      ) {
        currentValue += '"';

        index += 1;

        continue;
      }

      insideQuotes =
        !insideQuotes;

      continue;
    }

    if (
      character === "," &&
      !insideQuotes
    ) {
      currentRow.push(
        currentValue,
      );

      currentValue = "";

      continue;
    }

    if (
      character === "\n" &&
      !insideQuotes
    ) {
      currentRow.push(
        currentValue,
      );

      rows.push(
        currentRow,
      );

      currentRow = [];

      currentValue = "";

      continue;
    }

    if (
      character === "\r" &&
      !insideQuotes
    ) {
      if (
        normalizedText[
          index + 1
        ] === "\n"
      ) {
        index += 1;
      }

      currentRow.push(
        currentValue,
      );

      rows.push(
        currentRow,
      );

      currentRow = [];

      currentValue = "";

      continue;
    }

    currentValue +=
      character;
  }

  if (insideQuotes) {
    throw new Error(
      "The CSV file contains an unclosed quoted value.",
    );
  }

  if (
    currentValue.length >
      0 ||
    currentRow.length >
      0
  ) {
    currentRow.push(
      currentValue,
    );

    rows.push(
      currentRow,
    );
  }

  return rows.filter(
    (row) =>
      !row.every(
        (value) =>
          value.trim() ===
          "",
      ),
  );
}

/**
 * Validate the uploaded CSV against
 * the exact downloaded template.
 */
export function validateInvitationCsv(
  text: string,
  actorRole: InvitationRoleKey,
  existingEmails: string[],
): ImportInvitationValidationResult {
  const rows =
    parseCsv(text);

  if (rows.length === 0) {
    throw new Error(
      "The uploaded file is empty.",
    );
  }

  const headers =
    rows[0].map((header) =>
      header
        .trim()
        .toLowerCase(),
    );

  const expectedHeaders =
    Array.from(
      INVITATION_TEMPLATE_COLUMNS,
    );

  const hasExactHeaders =
    headers.length ===
      expectedHeaders.length &&
    headers.every(
      (header, index) =>
        header ===
        expectedHeaders[index],
    );

  if (!hasExactHeaders) {
    throw new Error(
      `Invalid template. Required columns are: ${expectedHeaders.join(
        ", ",
      )}. Download the latest template and try again.`,
    );
  }

  const dataRows =
    rows.slice(1);

  if (
    dataRows.length === 0
  ) {
    throw new Error(
      "The uploaded file does not contain any invitation rows.",
    );
  }

  if (
    dataRows.length >
    MAX_IMPORT_ROWS
  ) {
    throw new Error(
      `The file contains ${dataRows.length} invitation rows. The maximum allowed is ${MAX_IMPORT_ROWS}.`,
    );
  }

  const allowedRoles =
    new Set(
      getInvitableRoleKeys(
        actorRole,
      ),
    );

  const existingEmailSet =
    new Set(
      existingEmails.map(
        normalizeEmail,
      ),
    );

  const seenEmails =
    new Set<string>();

  const valid: ImportInvitationInput[] =
    [];

  const invalid: ImportInvitationRowError[] =
    [];

  dataRows.forEach(
    (row, index) => {
      const line =
        index + 2;

      const values =
        row.map((value) =>
          value.trim(),
        );

      if (
        values.length !== 3
      ) {
        invalid.push({
          line,
          values,
          reason:
            "Each row must contain exactly three fields: email, name, and role.",
        });

        return;
      }

      const [
        rawEmail,
        rawName,
        rawRole,
      ] = values;

      const email =
        normalizeEmail(
          rawEmail,
        );

      const name =
        rawName.trim();

      const roleKey =
        rawRole
          .trim()
          .toUpperCase();

      if (!email) {
        invalid.push({
          line,
          values,
          reason:
            "Email is required.",
        });

        return;
      }

      if (!isValidEmail(email)) {
        invalid.push({
          line,
          values,
          reason:
            "Enter a valid email address.",
        });

        return;
      }

      if (!name) {
        invalid.push({
          line,
          values,
          reason:
            "Name is required.",
        });

        return;
      }

      if (name.length > 100) {
        invalid.push({
          line,
          values,
          reason:
            "Name must be 100 characters or less.",
        });

        return;
      }

      if (!roleKey) {
        invalid.push({
          line,
          values,
          reason:
            "Role is required.",
        });

        return;
      }

      if (
        !ROLE_KEYS.has(
          roleKey as InvitationRoleKey,
        )
      ) {
        invalid.push({
          line,
          values,
          reason:
            "Invalid role. Use OWNER, ADMIN, MANAGER, or MEMBER.",
        });

        return;
      }

      const typedRole =
        roleKey as InvitationRoleKey;

      if (
        !allowedRoles.has(
          typedRole,
        )
      ) {
        invalid.push({
          line,
          values,
          reason:
            `You are not allowed to assign the ${ROLE_LABELS[typedRole]} role.`,
        });

        return;
      }

      if (
        existingEmailSet.has(
          email,
        )
      ) {
        invalid.push({
          line,
          values,
          reason:
            "This email already has an invitation or membership in this organization.",
        });

        return;
      }

      if (
        seenEmails.has(
          email,
        )
      ) {
        invalid.push({
          line,
          values,
          reason:
            "This email appears more than once in the uploaded file.",
        });

        return;
      }

      seenEmails.add(
        email,
      );

      valid.push({
        email,
        name,
        roleKey:
          typedRole,
      });
    },
  );

  const previewRows = dataRows.map(
    (row, index) => {
      const line = index + 2;
      const values = row.map((value) =>
        value.trim(),
      );
      const rowError = invalid.find(
        (error) => error.line === line,
      );

      return {
        line,
        email: values[0] ?? "",
        name: values[1] ?? "",
        role: values[2] ?? "",
        valid: !rowError,
        reason: rowError?.reason ?? "",
      };
    },
  );

  return {
    rows: previewRows,
    valid,
    invalid,
  };
}