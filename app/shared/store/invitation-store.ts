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
  hydrate: (data: InvitationPageData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  add: (invitation: InvitationListItem) => void;
  addMany: (invitations: InvitationListItem[]) => void;
  update: (invitation: InvitationListItem) => void;
  reset: () => void;
};

function changeStats(
  stats: InvitationStats,
  status: InvitationListItem["status"],
  amount: 1 | -1,
) {
  const key = status.toLowerCase() as
    | "pending"
    | "accepted"
    | "expired"
    | "revoked";

  return {
    ...stats,
    [key]: Math.max(0, stats[key] + amount),
  };
}

function addOne(
  state: State,
  invitation: InvitationListItem,
) {
  if (!state.data) return state;

  if (
    state.data.invitations.some(
      (item) => item.id === invitation.id,
    )
  ) {
    return state;
  }

  const totalItems =
    state.data.pagination.totalItems + 1;

  return {
    ...state,
    data: {
      ...state.data,
      invitations: [
        invitation,
        ...state.data.invitations,
      ],
      stats: {
        ...changeStats(
          state.data.stats,
          invitation.status,
          1,
        ),
        total: state.data.stats.total + 1,
      },
      pagination: {
        ...state.data.pagination,
        totalItems,
        totalPages: Math.max(
          1,
          Math.ceil(
            totalItems /
              state.data.pagination.pageSize,
          ),
        ),
      },
    },
  };
}

export const useInvitationStore = create<State>(
  (set) => ({
    data: null,
    loading: false,
    error: null,

    hydrate: (data) =>
      set((state) => {
        if (
          state.data &&
          state.data.currentUserId ===
            data.currentUserId &&
          state.data.organization.id ===
            data.organization.id
        ) {
          return state;
        }

        return {
          data,
          error: null,
        };
      }),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    add: (invitation) =>
      set((state) => addOne(state, invitation)),

    addMany: (invitations) =>
      set((state) =>
        invitations.reduce(
          (next, invitation) =>
            addOne(next, invitation),
          state,
        ),
      ),

    update: (invitation) =>
      set((state) => {
        if (!state.data) return state;

        const old = state.data.invitations.find(
          (item) => item.id === invitation.id,
        );

        if (!old) return state;

        let stats = state.data.stats;

        if (old.status !== invitation.status) {
          stats = changeStats(
            stats,
            old.status,
            -1,
          );
          stats = changeStats(
            stats,
            invitation.status,
            1,
          );
        }

        return {
          data: {
            ...state.data,
            invitations:
              state.data.invitations.map(
                (item) =>
                  item.id === invitation.id
                    ? invitation
                    : item,
              ),
            stats,
          },
        };
      }),

    reset: () =>
      set({
        data: null,
        loading: false,
        error: null,
      }),
  }),
);
