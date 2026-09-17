import "server-only";

import { Op } from "sequelize";

import { requireAuth } from "@/lib/auth/authorization";

import type {
  MarkNotificationReadInput,
  NotificationsData,
  UserNotification,
} from "./types";

function toNotification(
  notification: Record<string, unknown>,
): UserNotification {
  return {
    id: String(notification.id),

    type:
      notification.type as UserNotification["type"],

    title: String(notification.title),

    message: String(notification.message),

    metadata:
      (notification.metadata as Record<
        string,
        unknown
      > | null) ?? null,

    readAt:
      notification.readAt
        ? new Date(
            String(notification.readAt),
          ).toISOString()
        : null,

    createdAt: new Date(
      String(notification.createdAt),
    ).toISOString(),
  };
}

export async function getNotifications(): Promise<NotificationsData> {
  const auth = await requireAuth();

  const notificationModule =
    await import(
      "@/db/models/notification"
    );

  const Notification =
    notificationModule.default;

  const rows =
    await Notification.findAll({
      where: {
        userId: auth.user.id,
      },
      order: [
        ["createdAt", "DESC"],
      ],
      limit: 50,
      raw: true,
    });

  const unreadCount =
    await Notification.count({
      where: {
        userId: auth.user.id,
        readAt: {
          [Op.is]: null,
        },
      },
    });

  return {
    notifications: rows.map(
      (row: Record<string, unknown>) =>
        toNotification(row),
    ),
    unreadCount,
  };
}

export async function markNotificationRead(
  notificationId: string,
  input: MarkNotificationReadInput,
) {
  const auth = await requireAuth();

  if (!notificationId) {
    throw new Error(
      "Notification ID is required.",
    );
  }

  const notificationModule =
    await import(
      "@/db/models/notification"
    );

  const Notification =
    notificationModule.default;

  const [updatedCount] =
    await Notification.update(
      {
        readAt: input.read
          ? new Date()
          : null,
      },
      {
        where: {
          id: notificationId,
          userId: auth.user.id,
        },
      },
    );

  if (updatedCount !== 1) {
    throw new Error(
      "Notification not found.",
    );
  }

  return {
    success: true,
  };
}

export async function markAllNotificationsRead() {
  const auth = await requireAuth();

  const notificationModule =
    await import(
      "@/db/models/notification"
    );

  const Notification =
    notificationModule.default;

  await Notification.update(
    {
      readAt: new Date(),
    },
    {
      where: {
        userId: auth.user.id,
        readAt: {
          [Op.is]: null,
        },
      },
    },
  );

  return {
    success: true,
  };
}