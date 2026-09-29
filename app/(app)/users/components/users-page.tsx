"use client";

import type { UserRoleKey, UsersDirectoryData } from "@/lib/users/types";

import { UsersDirectory } from "./users-directory";

type Props = {
  data: UsersDirectoryData & {
    canUpdate: boolean;
    canDelete: boolean;
    currentUserId: string;
    currentRole: UserRoleKey;
  };
};

export function UsersPage({ data }: Props) {
  return <UsersDirectory {...data} />;
}
