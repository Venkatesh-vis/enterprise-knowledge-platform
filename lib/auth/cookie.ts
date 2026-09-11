import "server-only";

import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-ekp_access_token" : "ekp_access_token";

const COOKIE_MAX_AGE = 15 * 60;

export async function setAuthCookie(
  token: string,
) {
  const cookieStore = await cookies();

  cookieStore.set(
    AUTH_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    },
  );
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.set(
    AUTH_COOKIE_NAME,
    "",
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    },
  );
}