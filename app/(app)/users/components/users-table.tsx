"use client";

import { Pencil, UserRoundX } from "lucide-react";

import { ActionMenu } from "@/app/shared/ui/action-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@/app/shared/ui/table";
import type { UserListItem } from "@/lib/users/types";

import { RoleBadge } from "./role-badge";

type Props = {
  users: UserListItem[];
  currentUserId: string;
  currentUserRole: string;
  canUpdate: boolean;
  canDelete: boolean;
  mutationId: string | null;
  onChangeRole: (user: UserListItem) => void;
  onRemove: (user: UserListItem) => void;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function canManageTarget(currentRole: string, targetRole: string) {
  return targetRole !== "OWNER" || currentRole === "OWNER";
}

export function UsersTable({
  users,
  currentUserId,
  currentUserRole,
  canUpdate,
  canDelete,
  mutationId,
  onChangeRole,
  onRemove,
}: Props) {
  if (!users.length) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">No users found.</p>
        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or role filter.
        </p>
      </div>
    );
  }

  return (
    <TableScroll>
      <Table className="min-w-[760px]">
        <TableHeader>
          <tr>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isMutating = mutationId === user.id;
            const manageable = canManageTarget(currentUserRole, user.roleKey);
            const items = [];

            if (canUpdate && !isSelf && manageable) {
              items.push({
                label: isMutating ? "Updating…" : "Change role",
                icon: Pencil,
                disabled: isMutating,
                onSelect: () => onChangeRole(user),
              });
            }

            if (canDelete && !isSelf && manageable) {
              items.push({
                label: "Remove user",
                icon: UserRoundX,
                danger: true,
                disabled: isMutating,
                onSelect: () => onRemove(user),
              });
            }

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {initials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.roleKey} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-slate-500">
                  {formatDate(user.joinedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <ActionMenu
                    label={`Actions for ${user.name}`}
                    items={
                      items.length
                        ? items
                        : [
                            {
                              label: isSelf
                                ? "Your account"
                                : "No actions available",
                              disabled: true,
                            },
                          ]
                    }
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
