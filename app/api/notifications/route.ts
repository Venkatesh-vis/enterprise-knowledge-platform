import { NextRequest, NextResponse } from "next/server";

import {
  AuthorizationError,
} from "@/lib/auth/authorization";

import {
  getNotifications,
  markAllNotificationsRead,
} from "@/lib/notifications/notification-service";

function errorResponse(
  error: unknown,
) {
  if (
    error instanceof AuthorizationError
  ) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.statusCode,
      },
    );
  }

  console.error(
    "Notifications API error:",
    error,
  );

  return NextResponse.json(
    {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to process notifications.",
    },
    {
      status: 500,
    },
  );
}

export async function GET() {
  try {
    const data =
      await getNotifications();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    if (
      body?.action !==
      "mark-all-read"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid notification action.",
        },
        {
          status: 400,
        },
      );
    }

    const data =
      await markAllNotificationsRead();

    return NextResponse.json({
      ...data,
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}