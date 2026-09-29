"use client";

import { create } from "zustand";

import { apiRequest } from "@/app/shared/lib/api";
import type { NotificationsData, UserNotification } from "@/lib/notifications/types";

type Response = {
  success: boolean;
  message?: string;
  data: NotificationsData;
};

type Store = {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  markRead: (id: string) => Promise<boolean>;
  markAllRead: () => Promise<boolean>;
  clearError: () => void;
};

function getError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const useNotificationStore = create<Store>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isLoaded: false,
  error: null,

  load: async (force = false) => {
    if (get().isLoading || (get().isLoaded && !force)) return;

    set({ isLoading: true, error: null });

    try {
      const response = await apiRequest<Response>({
        path: "/api/notifications",
        method: "GET",
      });

      if (!response.success) {
        throw new Error(
          response.message ?? "Unable to load notifications.",
        );
      }

      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        isLoaded: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getError(error, "Unable to load notifications."),
      });
    }
  },

  markRead: async (id) => {
    const item = get().notifications.find(
      (notification) => notification.id === id,
    );

    if (!item || item.readAt) return true;

    const readAt = new Date().toISOString();

    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, readAt }
          : notification,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
      error: null,
    }));

    try {
      const response = await apiRequest<{
        success: boolean;
        message?: string;
      }>({
        path: `/api/notifications/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: { read: true },
      });

      if (!response.success) {
        throw new Error(
          response.message ?? "Unable to mark notification as read.",
        );
      }

      return true;
    } catch (error) {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, readAt: null }
            : notification,
        ),
        unreadCount: state.unreadCount + 1,
        error: getError(
          error,
          "Unable to mark notification as read.",
        ),
      }));
      return false;
    }
  },

  markAllRead: async () => {
    if (get().unreadCount === 0) return true;

    const unreadIds = get()
      .notifications.filter((item) => !item.readAt)
      .map((item) => item.id);
    const now = new Date().toISOString();

    set((state) => ({
      notifications: state.notifications.map((item) =>
        unreadIds.includes(item.id)
          ? { ...item, readAt: now }
          : item,
      ),
      unreadCount: 0,
      error: null,
    }));

    try {
      const response = await apiRequest<{
        success: boolean;
        message?: string;
      }>({
        path: "/api/notifications",
        method: "PATCH",
        body: { action: "mark-all-read" },
      });

      if (!response.success) {
        throw new Error(
          response.message ?? "Unable to mark notifications as read.",
        );
      }

      return true;
    } catch (error) {
      set((state) => ({
        notifications: state.notifications.map((item) =>
          unreadIds.includes(item.id)
            ? { ...item, readAt: null }
            : item,
        ),
        unreadCount: unreadIds.length,
        error: getError(
          error,
          "Unable to mark notifications as read.",
        ),
      }));
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
