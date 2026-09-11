import "server-only";

import { cookies } from "next/headers";
import {AUTH_COOKIE_NAME} from "./cookie";
import {verifyAccessToken,type AuthTokenPayload} from "./jwt";

export async function getCurrentUser(): Promise<
  AuthTokenPayload | null
> {
  const cookieStore = await cookies();

  const token = cookieStore.get(AUTH_COOKIE_NAME,)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}