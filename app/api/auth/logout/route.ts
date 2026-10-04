import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/auth/cookie";
import { checkApiRateLimit } from "@/lib/http/api-rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimitResponse = await checkApiRateLimit(request, {
    limit: 30,
    windowSeconds: 60,
    keyPrefix: "auth-logout",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  await clearAuthCookie();

  return NextResponse.json(
    { success: true, message: "Logout successful." },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
