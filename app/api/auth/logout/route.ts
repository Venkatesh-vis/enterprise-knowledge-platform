import { NextResponse } from "next/server";
import {clearAuthCookie,} from "@/lib/auth/cookie";


export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json(
      {
        success: true,
        message: "Logout successful.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Logout error:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete logout.",
      },
      { status: 500 },
    );
  }
}