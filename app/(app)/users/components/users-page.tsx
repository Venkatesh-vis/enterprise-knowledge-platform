"use client";

import type {
  UsersDirectoryData,
} from "@/lib/users/types";

import { UsersDirectory } from "./users-directory";

type Props = {
  data: UsersDirectoryData;
};

export function UsersPage({
  data,
}: Props) {
  return (
    <UsersDirectory
      data={data}
    />
  );
}