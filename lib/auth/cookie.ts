import "server-only";

import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME =
  process.env.NODE_ENV ===
  "production"
    ? "__Host-ekp_access_token"
    : "ekp_access_token";

export const AUTH_COOKIE_MAX_AGE =
  15 * 60;

const baseCookieOptions = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV ===
    "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookie(
  token: string,
) {
  const store =
    await cookies();

  store.set(
    AUTH_COOKIE_NAME,
    token,
    {
      ...baseCookieOptions,
      maxAge:
        AUTH_COOKIE_MAX_AGE,
    },
  );
}

export async function clearAuthCookie() {
  const store =
    await cookies();

  store.set(
    AUTH_COOKIE_NAME,
    "",
    {
      ...baseCookieOptions,
      maxAge: 0,
    },
  );
}