"use client";

import { create } from "zustand";

import type {
  AuthSnapshot,
} from "@/app/shared/lib/auth/types";

import {
  apiRequest,
} from "@/app/shared/lib/api";

type AuthStore = {
  user: AuthSnapshot["user"] | null;

  organization:
    | AuthSnapshot["organization"]
    | null;

  membership:
    | AuthSnapshot["membership"]
    | null;

  permissions: AuthSnapshot["permissions"];

  isAuthenticated: boolean;

  setAuth: (
    auth: AuthSnapshot,
  ) => void;

  clearAuth: () => void;

  refreshAuth: () => Promise<void>;

  logout: () => Promise<void>;
};

export const useAuthStore =
  create<AuthStore>(
    (set) => ({
      user: null,
      organization: null,
      membership: null,
      permissions: [],
      isAuthenticated: false,

      setAuth: (auth) =>
        set({
          user: auth.user,
          organization:
            auth.organization,
          membership:
            auth.membership,
          permissions:
            auth.permissions,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          organization: null,
          membership: null,
          permissions: [],
          isAuthenticated: false,
        }),

      refreshAuth: async () => {
        try {
          const response =
            await apiRequest<{
              success: boolean;
              data?: {
                user: AuthSnapshot["user"];
                organization:
                  AuthSnapshot["organization"];
                membership:
                  AuthSnapshot["membership"];
              };
            }>({
              path:
                "/api/auth/me",
              method: "GET",
            });

          if (
            !response.success ||
            !response.data
          ) {
            throw new Error(
              "Authentication expired.",
            );
          }

          const permissionResponse =
            await apiRequest<{
              success: boolean;
              data?: {
                permissions:
                  AuthSnapshot["permissions"];
              };
            }>({
              path:
                "/api/auth/permissions",
              method: "GET",
            });

          if (
            !permissionResponse.success ||
            !permissionResponse.data
          ) {
            throw new Error(
              "Unable to load permissions.",
            );
          }

          set({
            user:
              response.data.user,

            organization:
              response.data.organization,

            membership:
              response.data.membership,

            permissions:
              permissionResponse.data
                .permissions,

            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            organization: null,
            membership: null,
            permissions: [],
            isAuthenticated: false,
          });

          throw error;
        }
      },

      logout: async () => {
        try {
          await apiRequest({
            path:
              "/api/auth/logout",
            method: "POST",
          });
        } finally {
          set({
            user: null,
            organization: null,
            membership: null,
            permissions: [],
            isAuthenticated: false,
          });
        }
      },
    }),
  );