"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  BriefcaseBusiness,
  Search,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  UserListItem,
  UsersDirectoryData,
} from "@/lib/users/types";

import { Select } from "@/app/shared/ui/select";
import { Input } from "@/app/shared/ui/input";
import { Button } from "@/app/shared/ui/button";

import { apiRequest } from "@/app/shared/lib/api";

import { RoleBadge } from "./role-badge";
import { UserFormDialog } from "./user-form-dialog";
import { UserRemoveDialog } from "./user-remove-dialog";

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

  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""
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

function updateQueryString(
  pathname: string,
  currentSearch: string,
  changes: Record<
    string,
    string | null
  >,
) {
  const params = new URLSearchParams(
    currentSearch,
  );

  for (const [
    key,
    value,
  ] of Object.entries(changes)) {
    if (!value) {
      params.delete(key);
    } else {
      params.set(
        key,
        value,
      );
    }
  }

  const query =
    params.toString();

  return query
    ? `${pathname}?${query}`
    : pathname;
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  );
}

function UserAvatar({
  user,
}: {
  user: UserListItem;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
      {user.image ? (
        <img
          src={user.image}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials(user.name)
      )}
    </div>
  );
}

export function UsersDirectory({
  data,
}: {
  data: UsersDirectoryData;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  /*
   * Keep the displayed directory data
   * locally updated after role changes/removals.
   */
  const [users, setUsers] =
    useState<UserListItem[]>(
      data.users,
    );

  const [stats, setStats] =
    useState(data.stats);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    editingUser,
    setEditingUser,
  ] =
    useState<UserListItem | null>(
      null,
    );

  const [
    removingUser,
    setRemovingUser,
  ] =
    useState<UserListItem | null>(
      null,
    );

  const [
    isUpdatingRole,
    setIsUpdatingRole,
  ] = useState(false);

  const [
    roleUpdateError,
    setRoleUpdateError,
  ] = useState<
    string | null
  >(null);

  const [
    notice,
    setNotice,
  ] = useState("");

  /*
   * Read filters directly from the URL.
   *
   * Current service contract:
   * search
   * roleId
   * page
   * pageSize
   */
  const currentSearch =
    searchParams.get(
      "search",
    ) ?? "";

  const currentRoleId =
    searchParams.get(
      "roleId",
    ) ?? "ALL";

  /*
   * Keep local UI state synchronized with
   * the latest server-rendered result.
   *
   * Search/filter changes update the table
   * data, but never the organization stats.
   */
  useEffect(() => {
    setUsers(data.users);
  }, [data.users]);

  useEffect(() => {
    setStats(data.stats);
  }, [data.stats]);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const currentPage =
    data.pagination.page;

  const totalPages =
    data.pagination.totalPages;

  const totalItems =
    data.pagination.totalItems;

  const hasUsers =
    users.length > 0;

  const hasFilters =
    Boolean(currentSearch) ||
    currentRoleId !== "ALL";

  const pageNumbers =
    useMemo(() => {
      const pages =
        new Set<number>();

      pages.add(1);
      pages.add(totalPages);

      pages.add(
        Math.max(
          1,
          currentPage - 1,
        ),
      );

      pages.add(
        currentPage,
      );

      pages.add(
        Math.min(
          totalPages,
          currentPage + 1,
        ),
      );

      return [
        ...pages,
      ]
        .filter(
          (page) =>
            page >= 1 &&
            page <=
            totalPages,
        )
        .sort(
          (a, b) =>
            a - b,
        );
    }, [
      currentPage,
      totalPages,
    ]);

  function navigate(
    changes: Record<
      string,
      string | null
    >,
  ) {
    router.push(
      updateQueryString(
        pathname,
        `?${searchParams.toString()}`,
        changes,
      ),
    );
  }

  function showNotice(
    message: string,
  ) {
    setNotice(message);

    window.setTimeout(
      () => {
        setNotice("");
      },
      3500,
    );
  }

  const roleFilterOptions =
    useMemo(
      () => [
        {
          value: "ALL",
          label: "All roles",
        },
        ...data.roles.map(
          (role) => ({
            value: role.id,
            label: role.name,
          }),
        ),
      ],
      [data.roles],
    );

  async function handleRoleUpdate(
    userId: string,
    roleId: string,
  ) {
    setIsUpdatingRole(
      true,
    );

    setRoleUpdateError(
      null,
    );

    try {
      type UserRoleUpdateResponse = {
        success: boolean;
        message?: string;
        data: {
          user: UserListItem;
          permissions: unknown[];
        };
      };

      const response =
        await apiRequest<UserRoleUpdateResponse>({
          path: `/api/users/${encodeURIComponent(userId)}`,
          method: "PATCH",
          body: {
            roleId,
          },
        });

      if (!response.success) {
        throw new Error(
          response.message ??
            "Unable to update the user role.",
        );
      }

      const updatedUser =
        response.data.user;

      const previousUser =
        users.find(
          (user) =>
            user.id === userId,
        );

      setUsers((currentUsers) => {
        const nextUsers =
          currentUsers.map(
            (user) =>
              user.id ===
              updatedUser.id
                ? updatedUser
                : user,
          );

        /*
         * A user that no longer matches the
         * active role filter must disappear
         * immediately from the current view.
         */
        if (
          currentRoleId !== "ALL" &&
          updatedUser.roleId !==
            currentRoleId
        ) {
          return nextUsers.filter(
            (user) =>
              user.id !==
              updatedUser.id,
          );
        }

        return nextUsers;
      });

      if (
        previousUser &&
        previousUser.roleKey !==
          updatedUser.roleKey
      ) {
        setStats((currentStats) => {
          const nextStats = {
            ...currentStats,
          };

          if (
            previousUser.roleKey ===
            "OWNER"
          ) {
            nextStats.owners -= 1;
          } else if (
            previousUser.roleKey ===
            "ADMIN"
          ) {
            nextStats.admins -= 1;
          } else if (
            previousUser.roleKey ===
            "MANAGER"
          ) {
            nextStats.managers -= 1;
          } else if (
            previousUser.roleKey ===
            "MEMBER"
          ) {
            nextStats.members -= 1;
          }

          if (
            updatedUser.roleKey ===
            "OWNER"
          ) {
            nextStats.owners += 1;
          } else if (
            updatedUser.roleKey ===
            "ADMIN"
          ) {
            nextStats.admins += 1;
          } else if (
            updatedUser.roleKey ===
            "MANAGER"
          ) {
            nextStats.managers += 1;
          } else if (
            updatedUser.roleKey ===
            "MEMBER"
          ) {
            nextStats.members += 1;
          }

          return nextStats;
        });
      }

      setEditingUser(
        null,
      );

      showNotice(
        "User role updated successfully.",
      );

      router.refresh();

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update the user role.";

      setRoleUpdateError(
        message,
      );

      return false;
    } finally {
      setIsUpdatingRole(
        false,
      );
    }
  }

  function handleUserRemoved(
    userId: string,
  ) {
    const removedUser =
      users.find(
        (user) =>
          user.id === userId,
      );

    setUsers(
      (currentUsers) =>
        currentUsers.filter(
          (user) =>
            user.id !== userId,
        ),
    );

    if (removedUser) {
      setStats((currentStats) => {
        const nextStats = {
          ...currentStats,
        };

        nextStats.total =
          Math.max(
            0,
            nextStats.total - 1,
          );

        switch (
          removedUser.roleKey
        ) {
          case "OWNER":
            nextStats.owners =
              Math.max(
                0,
                nextStats.owners - 1,
              );
            break;

          case "ADMIN":
            nextStats.admins =
              Math.max(
                0,
                nextStats.admins - 1,
              );
            break;

          case "MANAGER":
            nextStats.managers =
              Math.max(
                0,
                nextStats.managers - 1,
              );
            break;

          case "MEMBER":
            nextStats.members =
              Math.max(
                0,
                nextStats.members - 1,
              );
            break;
        }

        return nextStats;
      });
    }

    setRemovingUser(
      null,
    );

    showNotice(
      "User removed from the organization.",
    );

    /*
     * Refresh the server-rendered directory so
     * pagination and totals reconcile with the
     * mutation immediately.
     */
    router.refresh();

    /*
     * If the current page became empty,
     * move to the previous page.
     */
    if (
      users.length === 1 &&
      currentPage > 1
    ) {
      navigate({
        page: String(
          currentPage - 1,
        ),
      });
    }
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {notice}
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Organization
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Users
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage people, organization
            roles, and access for this
            workspace.
          </p>
        </div>
      </header>

      <section
        aria-label="User statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total users"
          value={
            stats.total
          }
          icon={UsersIcon}
        />

        <StatCard
          label="Administrators"
          value={
            stats.admins
          }
          icon={ShieldCheck}
        />

        <StatCard
          label="Managers"
          value={
            stats.managers
          }
          icon={BriefcaseBusiness}
        />

        <StatCard
          label="Members"
          value={
            stats.members
          }
          icon={UsersIcon}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();

              const form =
                new FormData(
                  event.currentTarget,
                );

              const search =
                String(
                  form.get(
                    "search",
                  ) ?? "",
                ).trim();

              navigate({
                search:
                  search || null,
                page: "1",
              });
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                name="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value,
                  )
                }
                placeholder="Search by name or email"
                className="h-11 pl-10"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="h-11"
            >
              Search
            </Button>
          </form>

          <div className="w-full lg:w-52">
            <Select
              value={
                currentRoleId
              }
              onValueChange={(
                value,
              ) => {
                navigate({
                  roleId:
                    value ===
                      "ALL"
                      ? null
                      : value,
                  page: "1",
                });
              }}
              options={
                roleFilterOptions
              }
              aria-label="Filter by role"
            />
          </div>
        </div>

        {!hasUsers &&
          hasFilters ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Search className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-950">
              No users found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try a different name,
              email, or role
              filter.
            </p>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                router.push(
                  "/users",
                )
              }
              className="mt-5"
            >
              Clear filters
            </Button>
          </div>
        ) : !hasUsers ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <UsersIcon className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-950">
              No users yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently
              no members in this
              organization.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      User
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Role
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(
                    (user) => (
                      <tr
                        key={
                          user.id
                        }
                        className="border-b border-slate-100 hover:bg-slate-50/60 last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/users/${user.id}`}
                            className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                          >
                            <UserAvatar
                              user={
                                user
                              }
                            />

                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-slate-600">
                                {
                                  user.name
                                }
                              </span>

                              <span className="mt-0.5 block truncate text-xs text-slate-500">
                                {
                                  user.email
                                }
                              </span>
                            </span>
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <RoleBadge
                            role={
                              user.roleKey
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            user.joinedAt,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/users/${user.id}`}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              View
                            </Link>

                            {data.canUpdate &&
                              user.id !==
                              data.currentUserId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRoleUpdateError(
                                      null,
                                    );
                                    setEditingUser(
                                      user,
                                    );
                                  }}
                                  className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                >
                                  Edit
                                </button>
                              )}

                            {data.canDelete &&
                              user.id !==
                              data.currentUserId &&
                              (
                                user.roleKey !==
                                "OWNER" ||
                                data.currentRole ===
                                "OWNER"
                              ) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRemovingUser(
                                      user,
                                    )
                                  }
                                  className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {users.map(
                (user) => (
                  <article
                    key={
                      user.id
                    }
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        user={
                          user
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/users/${user.id}`}
                          className="block truncate text-sm font-semibold text-slate-950"
                        >
                          {
                            user.name
                          }
                        </Link>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {
                            user.email
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <RoleBadge
                            role={
                              user.roleKey
                            }
                          />

                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
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
                          className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          View
                        </Link>

                        {data.canUpdate &&
                          user.id !==
                          data.currentUserId && (
                            <button
                              type="button"
                              onClick={() => {
                                setRoleUpdateError(
                                  null,
                                );
                                setEditingUser(
                                  user,
                                );
                              }}
                              className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                          )}

                        {data.canDelete &&
                          user.id !==
                          data.currentUserId &&
                          (
                            user.roleKey !==
                            "OWNER" ||
                            data.currentRole ===
                            "OWNER"
                          ) && (
                            <button
                              type="button"
                              onClick={() =>
                                setRemovingUser(
                                  user,
                                )
                              }
                              className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          )}
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {
                    users.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {
                    totalItems
                  }
                </span>{" "}
                users
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={
                    currentPage <=
                    1
                  }
                  onClick={() =>
                    navigate({
                      page: String(
                        currentPage -
                        1,
                      ),
                    })
                  }
                  className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Previous
                </button>

                {pageNumbers.map(
                  (
                    page,
                    index,
                  ) => {
                    const previous =
                      pageNumbers[
                      index - 1
                      ];

                    const gap =
                      previous !==
                      undefined &&
                      page -
                      previous >
                      1;

                    return (
                      <span
                        key={
                          page
                        }
                        className="contents"
                      >
                        {gap && (
                          <span className="px-1 text-xs text-slate-400">
                            …
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            navigate({
                              page: String(
                                page,
                              ),
                            })
                          }
                          className={`h-8 min-w-8 cursor-pointer rounded-lg px-2 text-xs font-semibold transition ${page ===
                              currentPage
                              ? "bg-slate-950 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  },
                )}

                <button
                  type="button"
                  disabled={
                    currentPage >=
                    totalPages
                  }
                  onClick={() =>
                    navigate({
                      page: String(
                        currentPage +
                        1,
                      ),
                    })
                  }
                  className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Change Role */}
      <UserFormDialog
        open={
          Boolean(
            editingUser,
          )
        }
        user={editingUser}
        roles={data.roles}
        allowedRoleKeys={
          data.roles.map(
            (role) =>
              role.key,
          )
        }
        isSubmitting={
          isUpdatingRole
        }
        error={
          roleUpdateError
        }
        onClose={() => {
          if (!isUpdatingRole) {
            setEditingUser(
              null,
            );
            setRoleUpdateError(
              null,
            );
          }
        }}
        onSubmit={
          handleRoleUpdate
        }
      />

      {/* Remove User */}
      <UserRemoveDialog
        open={
          Boolean(
            removingUser,
          )
        }
        userId={
          removingUser?.id ??
          ""
        }
        userName={
          removingUser?.name ??
          ""
        }
        onClose={() =>
          setRemovingUser(
            null,
          )
        }
        onSuccess={() => {
          if (
            removingUser
              ?.id
          ) {
            handleUserRemoved(
              removingUser.id,
            );
          }
        }}
      />
    </div>
  );
}