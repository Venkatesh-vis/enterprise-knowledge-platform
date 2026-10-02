"use client";

import { useEffect } from "react";

import { useWorkspaceStore } from "@/app/shared/store/workspace-store";

export function WorkspaceSync() {
  const initialize = useWorkspaceStore((state) => state.initialize);
  const sync = useWorkspaceStore((state) => state.sync);

  useEffect(() => {
    void initialize();

    const handleWorkspaceChange = () => {
      void sync();
    };

    window.addEventListener("workspace:changed", handleWorkspaceChange);

    return () => {
      window.removeEventListener("workspace:changed", handleWorkspaceChange);
    };
  }, [initialize, sync]);

  return null;
}
