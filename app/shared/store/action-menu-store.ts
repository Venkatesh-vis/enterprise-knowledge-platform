"use client";

import { create } from "zustand";

type ActionMenuStore = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

export const useActionMenuStore = create<ActionMenuStore>((set) => ({
  openId: null,
  setOpenId: (openId) => set({ openId }),
}));
