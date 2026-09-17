"use client";

import Link from "next/link";
import {
  Bell,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { apiRequest } from "@/app/shared/lib/api";

import type {
  NotificationsData,
  UserNotification,
} from "@/lib/notifications/types";

import { NotificationItem } from "./notification-item";

type NotificationsResponse = {
  success: boolean;
  data: NotificationsData;
};

export function NotificationPopover() {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<
    UserNotification[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const containerRef =
    useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    setIsLoading(true);
    setError(null);

    try {
      const response =
        await apiRequest<NotificationsResponse>(
          {
            path: "/api/notifications",
            method: "GET",
          },
        );

      setNotifications(
        response.data.notifications,
      );

      setUnreadCount(
        response.data.unreadCount,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, [open]);

  async function handleRead(
    notificationId: string,
  ) {
    try {
      await apiRequest<{
        success: boolean;
      }>({
        path: `/api/notifications/${encodeURIComponent(
          notificationId,
        )}`,
        method: "PATCH",
        body: {
          read: true,
        },
      });

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    readAt:
                      new Date().toISOString(),
                  }
                : notification,
          ),
      );

      setUnreadCount(
        (count) =>
          Math.max(0, count - 1),
      );
    } catch {
      // Keep the current UI state if the
      // request fails.
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      await apiRequest<{
        success: boolean;
      }>({
        path: "/api/notifications",
        method: "PATCH",
        body: {
          action:
            "mark-all-read",
        },
      });

      const now =
        new Date().toISOString();

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              readAt:
                notification.readAt ??
                now,
            }),
          ),
      );

      setUnreadCount(0);
    } catch {
      // Keep existing UI state.
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen(
            (current) => !current,
          );
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <Bell className="h-[18px] w-[18px]" />

        {unreadCount > 0 ? (
          <>
            <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-slate-950 px-1 text-center text-[9px] font-semibold leading-4 text-white">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          </>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                Notifications
              </h2>

              {unreadCount > 0 ? (
                <p className="mt-0.5 text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-400">
                  You&apos;re all caught up
                </p>
              )}
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadNotifications()
                }
                className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : notifications.length ===
            0 ? (
            <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Bell className="h-4 w-4" />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                No notifications
              </p>

              <p className="mt-1 text-xs text-slate-400">
                New account and organization
                updates will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-[420px] overflow-y-auto">
                {notifications
                  .slice(0, 5)
                  .map(
                    (notification) => (
                      <NotificationItem
                        key={
                          notification.id
                        }
                        notification={
                          notification
                        }
                        onRead={
                          handleRead
                        }
                      />
                    ),
                  )}
              </div>

              <div className="border-t border-slate-100 p-2">
                <Link
                  href="/notifications"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  View all notifications
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}