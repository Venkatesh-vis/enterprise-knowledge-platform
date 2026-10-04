import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { checkApiRateLimit } from "@/lib/http/api-rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const rateLimitResponse = await checkApiRateLimit(request, {
    limit: 60,
    windowSeconds: 60,
    keyPrefix: "auth-me",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const auth = await getCurrentUser();

  if (!auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Current user.",
      data: {
        user: auth.user,
        organization: auth.organization,
        membership: auth.membership,
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
