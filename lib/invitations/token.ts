import {
  createHash,
  randomBytes,
} from "crypto";

import {
  INVITATION_TTL_DAYS,
} from "./constants";

export function createInvitationToken() {
  return randomBytes(32).toString("hex");
}

export function hashInvitationToken(
  token: string,
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function createInvitationActiveKey(
  organizationId: string,
  email: string,
) {
  return createHash("sha256")
    .update(
      `${organizationId}:${email}`,
    )
    .digest("hex");
}

export function createInvitationExpiry(
  now = new Date(),
) {
  const date = new Date(now);

  date.setDate(
    date.getDate() + INVITATION_TTL_DAYS,
  );

  return date;
}

export function isInvitationToken(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{64}$/.test(value)
  );
}

export function getInvitationUrl(
  token: string,
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is required.",
    );
  }

  return (
    `${baseUrl.replace(/\/$/, "")}` +
    `/invitations/${token}`
  );
}