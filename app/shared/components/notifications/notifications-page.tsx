"use client";

import { ArrowLeft, Bell, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { useNotificationStore } from "@/app/shared/store/notification-store";

import { NotificationItem } from "./notification-item";

export function NotificationsPage() {
  const notifications = useNotificationStore(
    (state) => state.notifications,
  );
  const unreadCount = useNotificationStore(
    (state) => state.unreadCount,
  );
  const isLoading = useNotificationStore(
    (state) => state.isLoading,
  );
  const error = useNotificationStore((state) => state.error);
  const load = useNotificationStore((state) => state.load);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore(
    (state) => state.markAllRead,
  );
  const clearError = useNotificationStore(
    (state) => state.clearError,
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-950">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Organization and account updates.
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={() => {
              clearError();
              void load(true);
            }}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
        {isLoading && !notifications.length ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-950">
              No notifications
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              You&apos;re all caught up. Important organization changes will appear here.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markRead}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
