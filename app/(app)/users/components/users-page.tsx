"use client";

import type { UsersDirectoryData } from "@/lib/users/types";
import { UsersDirectoryModern } from "./users-directory-modern";

type Props = {
  data: UsersDirectoryData;
};

export function UsersPage({ data }: Props) {
  return <UsersDirectoryModern data={data} />;
}
