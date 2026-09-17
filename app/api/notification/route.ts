import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import Notification from "@/db/models/notification";

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";
import {
  getCurrentUserId,
} from "@/lib/auth/get-current-user";

export async function GET() {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  const notifications =
    await Notification.findAll({
      where: {
        userId,
      },
      order: [
        ["createdAt", "DESC"],
      ],
      limit: 20,
      attributes: [
        "id",
        "type",
        "title",
        "message",
        "metadata",
        "readAt",
        "createdAt",
      ],
      raw: true,
    });

  return NextResponse.json({
    success: true,
    data: notifications,
  });
}