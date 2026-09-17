import { NextRequest, NextResponse } from "next/server";

import {
  AuthorizationError,
} from "@/lib/auth/authorization";

import {
  markNotificationRead,
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

  const message =
    error instanceof Error
      ? error.message
      : "Unable to update notification.";

  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: message ===
        "Notification not found."
        ? 404
        : 500,
    },
  );
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Notification ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      await request.json();

    const read =
      Boolean(body?.read);

    const data =
      await markNotificationRead(
        id,
        { read },
      );

    return NextResponse.json({
      ...data,
      message: read
        ? "Notification marked as read."
        : "Notification marked as unread.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}