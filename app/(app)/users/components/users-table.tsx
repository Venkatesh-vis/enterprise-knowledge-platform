"use client";

import Link from "next/link";

import type {
  UserListItem,
  UserRoleOption,
} from "@/lib/users/types";

import { RoleBadge } from "./role-badge";

type Props = {
  users: UserListItem[];
  roles: UserRoleOption[];

  currentUserId: string;
  currentUserRole: string;

  canUpdate: boolean;
  canDelete: boolean;

  mutationId: string | null;

  onChangeRole: (
    user: UserListItem,
  ) => void;

  onRemove: (
    user: UserListItem,
  ) => void;
};

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts.at(-1)?.[0] ?? ""
  }`.toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function canManageOwner(
  currentUserRole: string,
  targetRole: string,
) {
  if (targetRole !== "OWNER") {
    return true;
  }

  return (
    currentUserRole === "OWNER"
  );
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
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">
          No users found.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or
          role filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-slate-100 bg-slate-50/70">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-4">
                User
              </th>

              <th className="px-5 py-4">
                Role
              </th>

              <th className="px-5 py-4">
                Joined
              </th>

              <th className="px-5 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isSelf =
                user.id ===
                currentUserId;

              const isMutating =
                mutationId === user.id;

              const canManageTarget =
                canManageOwner(
                  currentUserRole,
                  user.roleKey,
                );

              return (
                <tr
                  key={user.id}
                  className="align-middle"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                        {initials(
                          user.name,
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/users/${user.id}`}
                          className="block truncate text-sm font-semibold text-slate-950 hover:underline"
                        >
                          {user.name}
                        </Link>

                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <RoleBadge
                      role={
                        user.roleKey
                      }
                    />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(
                      user.joinedAt,
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/users/${user.id}`}
                        className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        View
                      </Link>

                      {canUpdate &&
                      !isSelf &&
                      canManageTarget ? (
                        <button
                          type="button"
                          disabled={
                            isMutating
                          }
                          onClick={() =>
                            onChangeRole(
                              user,
                            )
                          }
                          className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isMutating
                            ? "Updating..."
                            : "Change role"}
                        </button>
                      ) : null}

                      {canDelete &&
                      !isSelf &&
                      canManageTarget ? (
                        <button
                          type="button"
                          disabled={
                            isMutating
                          }
                          onClick={() =>
                            onRemove(
                              user,
                            )
                          }
                          className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {users.map((user) => {
          const isSelf =
            user.id === currentUserId;

          const isMutating =
            mutationId === user.id;

          const canManageTarget =
            canManageOwner(
              currentUserRole,
              user.roleKey,
            );

          return (
            <article
              key={user.id}
              className="p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {initials(user.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/users/${user.id}`}
                    className="block truncate text-sm font-semibold text-slate-950"
                  >
                    {user.name}
                  </Link>

                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {user.email}
                  </p>

                  <div className="mt-3">
                    <RoleBadge
                      role={
                        user.roleKey
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Joined{" "}
                  {formatDate(
                    user.joinedAt,
                  )}
                </span>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/users/${user.id}`}
                    className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    View
                  </Link>

                  {canUpdate &&
                  !isSelf &&
                  canManageTarget ? (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() =>
                        onChangeRole(
                          user,
                        )
                      }
                      className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Role
                    </button>
                  ) : null}

                  {canDelete &&
                  !isSelf &&
                  canManageTarget ? (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() =>
                        onRemove(
                          user,
                        )
                      }
                      className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}