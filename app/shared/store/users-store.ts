"use client";

import { create } from "zustand";

import { apiRequest } from "@/app/shared/lib/api";

import type {
  UserListItem,
  UserRoleOption,
  UserRoleUpdateResult,
  UsersPagination,
} from "@/lib/users/types";

const PAGE_SIZE = 20;

type UsersResponse = {
  success: boolean;

  message?: string;

  data: {
    users: UserListItem[];

    pagination: UsersPagination;
  };
};

type RolesResponse = {
  success: boolean;

  message?: string;

  data: {
    roles: UserRoleOption[];
  };
};

type UsersStore = {
  users: UserListItem[];

  roles: UserRoleOption[];

  pagination: UsersPagination;

  searchInput: string;

  search: string;

  roleId: string;

  isLoading: boolean;

  isRefreshing: boolean;

  mutationId: string | null;

  error: string | null;

  initialized: boolean;

  initialize: () => Promise<void>;

  loadUsers: () => Promise<void>;

  loadRoles: () => Promise<void>;

  refresh: () => Promise<void>;

  setSearchInput: (
    value: string,
  ) => void;

  submitSearch: () => Promise<void>;

  setRoleId: (
    value: string,
  ) => Promise<void>;

  setPage: (
    page: number,
  ) => Promise<void>;

  updateRole: (
    userId: string,
    roleId: string,
  ) => Promise<UserRoleUpdateResult | null>;

  removeUser: (
    userId: string,
  ) => Promise<boolean>;

  clearError: () => void;
};

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    return (
      response?.data?.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function buildUsersPath({
  search,
  roleId,
  page,
}: {
  search: string;
  roleId: string;
  page: number;
}) {
  const params =
    new URLSearchParams();

  if (search) {
    params.set(
      "search",
      search,
    );
  }

  if (roleId) {
    params.set(
      "roleId",
      roleId,
    );
  }

  params.set(
    "page",
    String(page),
  );

  params.set(
    "pageSize",
    String(PAGE_SIZE),
  );

  return `/api/users?${params.toString()}`;
}

export const useUsersStore =
  create<UsersStore>((set, get) => ({
    users: [],

    roles: [],

    pagination: {
      page: 1,
      pageSize: PAGE_SIZE,
      totalItems: 0,
      totalPages: 1,
    },

    searchInput: "",

    search: "",

    roleId: "",

    isLoading: true,

    isRefreshing: false,

    mutationId: null,

    error: null,

    initialized: false,

    initialize: async () => {
      if (get().initialized) {
        return;
      }

      set({
        initialized: true,
        isLoading: true,
      });

      await Promise.all([
        get().loadUsers(),
        get().loadRoles(),
      ]);
    },

    loadUsers: async () => {
      const state = get();

      set({
        isRefreshing:
          state.initialized &&
          state.users.length > 0,

        error: null,
      });

      try {
        const response =
          await apiRequest<UsersResponse>({
            path: buildUsersPath({
              search:
                state.search,

              roleId:
                state.roleId,

              page:
                state.pagination.page,
            }),
          });

        if (!response.success) {
          throw new Error(
            response.message ??
            "Unable to load users.",
          );
        }

        set({
          users:
            response.data.users,

          pagination:
            response.data.pagination,

          isLoading: false,

          isRefreshing: false,

          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,

          isRefreshing: false,

          error:
            getErrorMessage(
              error,
              "Unable to load users.",
            ),
        });
      }
    },

    loadRoles: async () => {
      try {
        const response =
          await apiRequest<RolesResponse>({
            path: "/api/users/roles",
          });

        if (!response.success) {
          throw new Error(
            response.message ??
            "Unable to load roles.",
          );
        }

        set({
          roles:
            response.data.roles,
        });
      } catch (error) {
        set({
          error:
            getErrorMessage(
              error,
              "Unable to load roles.",
            ),
        });
      }
    },

    refresh: async () => {
      await Promise.all([
        get().loadUsers(),
        get().loadRoles(),
      ]);
    },

    setSearchInput: (
      value,
    ) => {
      set({
        searchInput: value,
      });
    },

    submitSearch: async () => {
      const search =
        get()
          .searchInput
          .trim();

      set((state) => ({
        search,

        pagination: {
          ...state.pagination,
          page: 1,
        },
      }));

      await get().loadUsers();
    },

    setRoleId: async (
      roleId,
    ) => {
      set((state) => ({
        roleId,

        pagination: {
          ...state.pagination,
          page: 1,
        },
      }));

      await get().loadUsers();
    },

    setPage: async (
      page,
    ) => {
      const state = get();

      const nextPage =
        Math.min(
          Math.max(
            page,
            1,
          ),
          state.pagination
            .totalPages,
        );

      if (
        nextPage ===
        state.pagination.page
      ) {
        return;
      }

      set((current) => ({
        pagination: {
          ...current.pagination,
          page: nextPage,
        },
      }));

      await get().loadUsers();
    },

    updateRole: async (
      userId,
      roleId,
    ) => {
      if (!userId) {
        set({
          error:
            "Target user ID is required.",
          mutationId: null,
        });

        return null;
      }

      if (!roleId) {
        set({
          error:
            "Target role ID is required.",
          mutationId: null,
        });

        return null;
      }

      set({
        mutationId: userId,
        error: null,
      });

      try {
        type UpdateRoleResponse = {
          success: boolean;
          message?: string;
          data?: UserRoleUpdateResult;
        };

        const response =
          await apiRequest<UpdateRoleResponse>({
            path: `/api/users/${encodeURIComponent(
              userId,
            )}`,

            method: "PATCH",

            body: {
              roleId,
            },
          });

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            response.message ??
            "Unable to update the user role.",
          );
        }

        const result =
          response.data;

        set((state) => ({
          users:
            state.users.map(
              (item) =>
                item.id ===
                  result.user.id
                  ? result.user
                  : item,
            ),

          mutationId: null,

          error: null,
        }));

        return result;
      } catch (error) {
        set({
          mutationId: null,

          error:
            getErrorMessage(
              error,
              "Unable to update the user role.",
            ),
        });

        return null;
      }
    },

    removeUser: async (
      userId,
    ) => {
      if (!userId) {
        set({
          error:
            "Target user ID is required.",

          mutationId:
            null,
        });

        return false;
      }

      set({
        mutationId: userId,

        error: null,
      });

      try {
        const response =
          await apiRequest<{
            success: boolean;

            message?: string;
          }>({
            path: `/api/users/${encodeURIComponent(
              userId,
            )}`,

            method: "DELETE",
          });

        if (!response.success) {
          throw new Error(
            response.message ??
            "Unable to remove the user.",
          );
        }

        set((state) => {
          const users =
            state.users.filter(
              (user) =>
                user.id !==
                userId,
            );

          const totalItems =
            Math.max(
              state.pagination
                .totalItems - 1,

              0,
            );

          const totalPages =
            Math.max(
              1,

              Math.ceil(
                totalItems /
                state
                  .pagination
                  .pageSize,
              ),
            );

          const page =
            Math.min(
              state.pagination.page,
              totalPages,
            );

          return {
            users,

            mutationId: null,

            pagination: {
              ...state.pagination,

              page,

              totalItems,

              totalPages,
            },
          };
        });

        return true;
      } catch (error) {
        set({
          mutationId: null,

          error:
            getErrorMessage(
              error,
              "Unable to remove the user.",
            ),
        });

        return false;
      }
    },

    clearError: () => {
      set({
        error: null,
      });
    },
  }));