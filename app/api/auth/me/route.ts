import { NextResponse } from "next/server";

import {
  getCurrentAuth,
} from "@/lib/auth/get-current-user";

export const runtime =
  "nodejs";

export async function GET() {
  const auth =
    await getCurrentAuth();

  if (!auth) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Not authenticated.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Current user.",
      data: {
        user: auth.user,
        organization:
          auth.organization,
        membership:
          auth.membership,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}