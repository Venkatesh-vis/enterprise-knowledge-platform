import { NextResponse } from "next/server";

import Notification from "@/db/models/notification";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { checkApiRateLimit } from "@/lib/http/api-rate-limit";

export async function GET(request: Request) {
  const rateLimitResponse = await checkApiRateLimit(request, {
    limit: 60,
    windowSeconds: 60,
    keyPrefix: "notification",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 },
    );
  }

  const notifications = await Notification.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    limit: 20,
    attributes: ["id", "type", "title", "message", "metadata", "readAt", "createdAt"],
    raw: true,
  });

  return NextResponse.json({ success: true, data: notifications });
}
