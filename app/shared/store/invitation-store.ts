import { create } from "zustand";

import type {
  InvitationListItem,
  InvitationPageData,
  InvitationStats,
} from "@/lib/invitations/types";

type State = {
  data: InvitationPageData | null;
  loading: boolean;
  error: string | null;
  setData: (data: InvitationPageData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  add: (invitation: InvitationListItem) => void;
  update: (invitation: InvitationListItem) => void;
  remove: (id: string) => void;
  reset: () => void;
};

function calculateStats(items: InvitationListItem[]): InvitationStats {
  return items.reduce(
    (stats, item) => {
      stats.total += 1;
      stats[item.status.toLowerCase() as "pending" | "accepted" | "expired" | "revoked"] += 1;
      return stats;
    },
    { total: 0, pending: 0, accepted: 0, expired: 0, revoked: 0 },
  );
}

export const useInvitationStore = create<State>((set) => ({
  data: null,
  loading: false,
  error: null,

  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  add: (invitation) => set((state) => {
    if (!state.data) return state;
    const invitations = [invitation, ...state.data.invitations];
    return {
      data: {
        ...state.data,
        invitations,
        stats: state.data.pagination.totalItems === invitations.length
          ? calculateStats(invitations)
          : state.data.stats,
        pagination: {
          ...state.data.pagination,
          totalItems: state.data.pagination.totalItems + 1,
          totalPages: Math.max(1, Math.ceil((state.data.pagination.totalItems + 1) / state.data.pagination.pageSize)),
        },
      },
    };
  }),

  update: (invitation) => set((state) => {
    if (!state.data) return state;
    const invitations = state.data.invitations.map((item) => item.id === invitation.id ? invitation : item);
    return {
      data: {
        ...state.data,
        invitations,
        stats: state.data.pagination.totalItems === invitations.length ? calculateStats(invitations) : state.data.stats,
      },
    };
  }),

  remove: (id) => set((state) => {
    if (!state.data) return state;
    const invitations = state.data.invitations.filter((item) => item.id !== id);
    return {
      data: {
        ...state.data,
        invitations,
        pagination: {
          ...state.data.pagination,
          totalItems: Math.max(0, state.data.pagination.totalItems - 1),
          totalPages: Math.max(1, Math.ceil(Math.max(0, state.data.pagination.totalItems - 1) / state.data.pagination.pageSize)),
        },
        stats: state.data.pagination.totalItems === invitations.length + 1 ? calculateStats(invitations) : state.data.stats,
      },
    };
  }),

  reset: () => set({ data: null, loading: false, error: null }),
}));
