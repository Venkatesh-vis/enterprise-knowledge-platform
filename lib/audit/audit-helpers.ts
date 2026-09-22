import { headers } from "next/headers";

import type {
  JsonObject,
  JsonValue,
} from "./audit-types";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "tokenhash",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "secret",
  "clientsecret",
  "privatekey",
  "otp",
]);

const MAX_DEPTH = 5;

const MAX_OBJECT_KEYS = 50;

const MAX_ARRAY_ITEMS = 50;

const MAX_STRING_LENGTH = 2_000;

function isPlainObject(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function truncateString(
  value: string,
) {
  if (
    value.length <=
    MAX_STRING_LENGTH
  ) {
    return value;
  }

  return `${value.slice(
    0,
    MAX_STRING_LENGTH,
  )}…`;
}

function sanitizeValue(
  value: unknown,
  depth: number,
):
  | JsonValue
  | undefined {
  if (value === null) {
    return null;
  }

  if (depth > MAX_DEPTH) {
    return "[Max depth reached]";
  }

  if (typeof value === "string") {
    return truncateString(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) =>
        sanitizeValue(
          item,
          depth + 1,
        ),
      )
      .filter(
        (
          item,
        ): item is JsonValue =>
          item !== undefined,
      );
  }

  if (isPlainObject(value)) {
    const result: JsonObject = {};

    for (const [
      index,
      [key, child],
    ] of Object.entries(
      value,
    ).entries()) {
      if (
        index >=
        MAX_OBJECT_KEYS
      ) {
        break;
      }

      const normalizedKey =
        key
          .replace(
            /[^a-zA-Z]/g,
            "",
          )
          .toLowerCase();

      if (
        SENSITIVE_KEYS.has(
          normalizedKey,
        )
      ) {
        result[key] =
          "[REDACTED]";

        continue;
      }

      const sanitized =
        sanitizeValue(
          child,
          depth + 1,
        );

      if (
        sanitized !==
        undefined
      ) {
        result[key] =
          sanitized;
      }
    }

    return result;
  }

  if (
    typeof value ===
    "bigint"
  ) {
    return String(value);
  }

  return undefined;
}

export function sanitizeAuditMetadata(
  metadata: unknown,
): JsonObject | null {
  if (
    metadata === null ||
    metadata === undefined
  ) {
    return null;
  }

  const sanitized =
    sanitizeValue(
      metadata,
      0,
    );

  if (
    !isPlainObject(
      sanitized,
    )
  ) {
    return null;
  }

  return sanitized as JsonObject;
}

export function getClientIpAddress(
  headerStore: Awaited<
    ReturnType<typeof headers>
  >,
) {
  const forwarded =
    headerStore.get(
      "x-forwarded-for",
    ) ??
    headerStore.get(
      "x-real-ip",
    );

  if (!forwarded) {
    return null;
  }

  const firstValue =
    forwarded
      .split(",")[0]
      ?.trim();

  return (
    firstValue?.slice(
      0,
      45,
    ) || null
  );
}

export function getRequestUserAgent(
  headerStore: Awaited<
    ReturnType<typeof headers>
  >,
) {
  const userAgent =
    headerStore.get(
      "user-agent",
    );

  return userAgent
    ? userAgent.slice(
        0,
        4_000,
      )
    : null;
}

export async function getAuditRequestMetadata() {
  const headerStore =
    await headers();

  return {
    ipAddress:
      getClientIpAddress(
        headerStore,
      ),

    userAgent:
      getRequestUserAgent(
        headerStore,
      ),
  };
}