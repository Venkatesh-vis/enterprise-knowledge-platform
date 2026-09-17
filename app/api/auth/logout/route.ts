import { NextResponse } from "next/server";

import {
  clearAuthCookie,
} from "@/lib/auth/cookie";

export const runtime =
  "nodejs";

export async function POST() {
  await clearAuthCookie();

  return NextResponse.json(
    {
      success: true,
      message:
        "Logout successful.",
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