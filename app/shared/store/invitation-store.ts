import { create } from "zustand";
import type { InvitationListItem, InvitationPageData, InvitationStats } from "@/lib/invitations/types";

type State = {
  data: InvitationPageData | null;
  loading: boolean;
  error: string | null;
  setData: (data: InvitationPageData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  add: (invitation: InvitationListItem) => void;
  update: (invitation: InvitationListItem) => void;
  reset: () => void;
};

type StatusKey = "pending" | "accepted" | "expired" | "revoked";

function changeStats(stats: InvitationStats, status: InvitationListItem["status"], amount: 1 | -1) {
  const key = status.toLowerCase() as StatusKey;
  return { ...stats, [key]: Math.max(0, stats[key] + amount) };
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
    return {
      data: {
        ...state.data,
        invitations: [invitation, ...state.data.invitations],
        stats: { ...changeStats(state.data.stats, invitation.status, 1), total: state.data.stats.total + 1 },
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
    const old = state.data.invitations.find((item) => item.id === invitation.id);
    if (!old) return state;
    let stats = state.data.stats;
    if (old.status !== invitation.status) {
      stats = changeStats(stats, old.status, -1);
      stats = changeStats(stats, invitation.status, 1);
    }
    return { data: { ...state.data, invitations: state.data.invitations.map((item) => item.id === invitation.id ? invitation : item), stats } };
  }),

  reset: () => set({ data: null, loading: false, error: null }),
}));
