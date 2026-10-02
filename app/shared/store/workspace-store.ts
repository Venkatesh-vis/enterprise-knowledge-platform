"use client";

import { create } from "zustand";

import { apiRequest } from "@/app/shared/lib/api";
import type { WorkspaceOverview } from "@/lib/workspace/types";

type WorkspaceResponse = {
  success: boolean;
  message?: string;
  data: WorkspaceOverview;
};

type WorkspaceStore = {
  overview: WorkspaceOverview | null;
  isLoading: boolean;
  isRefreshing: boolean;
  initialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  sync: () => Promise<void>;
  clearError: () => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  overview: null,
  isLoading: true,
  isRefreshing: false,
  initialized: false,
  error: null,

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    set({
      initialized: true,
      isLoading: true,
      error: null,
    });

    await get().sync();
  },

  sync: async () => {
    const state = get();

    set({
      isLoading: !state.overview,
      isRefreshing: Boolean(state.overview),
      error: null,
    });

    try {
      const response = await apiRequest<WorkspaceResponse>({
        path: "/api/workspace/overview",
      });

      if (!response.success) {
        throw new Error(response.message ?? "Unable to load workspace overview.");
      }

      set({
        overview: response.data,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : "Unable to load workspace overview.",
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
