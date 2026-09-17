"use client";

import {
  ShieldCheck,
  UserRoundX,
} from "lucide-react";

import type { UserNotification } from "@/lib/notifications/types";

type Props = {
  notification: UserNotification;
  onRead: (
    notificationId: string,
  ) => void;
};

function getIcon(
  type: UserNotification["type"],
) {
  if (
    type === "ROLE_CHANGED"
  ) {
    return ShieldCheck;
  }

  return UserRoundX;
}

function formatNotificationDate(
  value: string,
) {
  const date = new Date(value);

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

export function NotificationItem({
  notification,
  onRead,
}: Props) {
  const Icon =
    getIcon(notification.type);

  const isUnread =
    notification.readAt === null;

  return (
    <button
      type="button"
      onClick={() =>
        isUnread &&
        onRead(notification.id)
      }
      className={`w-full border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 ${
        isUnread
          ? "bg-slate-50/80 hover:bg-slate-100/70"
          : "bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isUnread
              ? "bg-slate-950 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={`text-sm ${
                isUnread
                  ? "font-semibold text-slate-950"
                  : "font-medium text-slate-700"
              }`}
            >
              {notification.title}
            </p>

            {isUnread ? (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-950" />
            ) : null}
          </div>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {notification.message}
          </p>

          <p className="mt-2 text-[11px] text-slate-400">
            {formatNotificationDate(
              notification.createdAt,
            )}
          </p>
        </div>
      </div>
    </button>
  );
}