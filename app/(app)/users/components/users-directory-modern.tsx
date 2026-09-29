"use client";

import {
  BriefcaseBusiness,
  CheckCircle2,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  UserListItem,
  UsersDirectoryData,
} from "@/lib/users/types";

import { apiRequest } from "@/app/shared/lib/api";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Pagination } from "@/app/shared/ui/pagination";
import { Select } from "@/app/shared/ui/select";

import { RoleBadge } from "./role-badge";
import { UserFormDialog } from "./user-form-dialog";
import { UserRemoveDialog } from "./user-remove-dialog";

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

function updateQuery(
  current: string,
  changes: Record<string, string | null>,
) {
  const params = new URLSearchParams(current);

  Object.entries(changes).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });

  const query = params.toString();
  return query ? `/users?${query}` : "/users";
}

function Avatar({ user }: { user: UserListItem }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
      {user.image ? (
        <img src={user.image} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(user.name)
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function UsersDirectoryModern({
  data,
}: {
  data: UsersDirectoryData;
}) {
  const [users, setUsers] = useState(data.users);
  const [stats, setStats] = useState(data.stats);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [removingUser, setRemovingUser] = useState<UserListItem | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setUsers(data.users), [data.users]);
  useEffect(() => setStats(data.stats), [data.stats]);
  useEffect(() => setMenuId(null), [data.users]);

  useEffect(() => {
    if (!menuId) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-user-menu]")) return;
      setMenuId(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuId(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuId]);

  const currentPage = data.pagination.page;
  const totalPages = data.pagination.totalPages;

  const currentSearch =
    typeof window === "undefined"
      ? ""
      : window.location.search;

  const roleId =
    new URLSearchParams(currentSearch).get("roleId") ?? "ALL";

  const roleOptions = useMemo(
    () => [
      { value: "ALL", label: "Every role" },
      ...data.roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    ],
    [data.roles],
  );

  function navigate(changes: Record<string, string | null>) {
    if (typeof window === "undefined") return;

    setMenuId(null);
    window.location.href = updateQuery(window.location.search, changes);
  }

  function updateRoleStats(previousRole: string, nextRole: string) {
    if (previousRole === nextRole) return;

    setStats((current) => {
      const next = { ...current };

      const decrement = (role: string) => {
        if (role === "OWNER") next.owners = Math.max(0, next.owners - 1);
        if (role === "ADMIN") next.admins = Math.max(0, next.admins - 1);
        if (role === "MANAGER") next.managers = Math.max(0, next.managers - 1);
        if (role === "MEMBER") next.members = Math.max(0, next.members - 1);
      };

      const increment = (role: string) => {
        if (role === "OWNER") next.owners += 1;
        if (role === "ADMIN") next.admins += 1;
        if (role === "MANAGER") next.managers += 1;
        if (role === "MEMBER") next.members += 1;
      };

      decrement(previousRole);
      increment(nextRole);

      return next;
    });
  }

  async function changeRole(userId: string, nextRoleId: string) {
    setBusy(true);
    setError(null);

    try {
      const result = await apiRequest<{
        success: boolean;
        message?: string;
        data: { user: UserListItem };
      }>({
        path: `/api/users/${encodeURIComponent(userId)}`,
        method: "PATCH",
        body: { roleId: nextRoleId },
      });

      if (!result.success) {
        throw new Error(result.message ?? "Unable to update user role.");
      }

      const previousUser = users.find((user) => user.id === userId);
      const updatedUser = result.data.user;

      updateRoleStats(
        previousUser?.roleKey ?? "",
        updatedUser.roleKey,
      );

      setUsers((current) =>
        current
          .map((user) =>
            user.id === userId ? updatedUser : user,
          )
          .filter(
            (user) => roleId === "ALL" || user.roleId === roleId,
          ),
      );

      setEditingUser(null);
      setMenuId(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update user role.",
      );
    } finally {
      setBusy(false);
    }
  }

  function removeUser(userId: string) {
    const removedUser = users.find((user) => user.id === userId);

    setUsers((current) => current.filter((user) => user.id !== userId));

    if (removedUser) {
      setStats((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        owners:
          removedUser.roleKey === "OWNER"
            ? Math.max(0, current.owners - 1)
            : current.owners,
        admins:
          removedUser.roleKey === "ADMIN"
            ? Math.max(0, current.admins - 1)
            : current.admins,
        managers:
          removedUser.roleKey === "MANAGER"
            ? Math.max(0, current.managers - 1)
            : current.managers,
        members:
          removedUser.roleKey === "MEMBER"
            ? Math.max(0, current.members - 1)
            : current.members,
      }));
    }

    setRemovingUser(null);
    setMenuId(null);
  }

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 px-6 py-7 shadow-sm">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
              <UsersRound className="h-3.5 w-3.5" />
              People & access
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              People
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage organization members and their access without leaving the directory.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace members
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
              {stats.total}
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat icon={ShieldCheck} label="Administrators" value={stats.admins} />
        <Stat icon={BriefcaseBusiness} label="Managers" value={stats.managers} />
        <Stat icon={UsersRound} label="Members" value={stats.members} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Team directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Use the menu on a person&apos;s card to change their role or remove access.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate({ search: search.trim() || null, page: "1" });
                  }
                }}
                placeholder="Search people..."
                className="h-11 rounded-xl bg-white pl-10"
              />
            </div>

            <Select
              value={roleId}
              onValueChange={(value) =>
                navigate({
                  roleId: value === "ALL" ? null : value,
                  page: "1",
                })
              }
              options={roleOptions}
              aria-label="Filter people by role"
              className="sm:w-48"
            />
          </div>
        </div>

        {users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <UsersRound className="mx-auto h-7 w-7 text-slate-400" />
            <h3 className="mt-4 text-base font-semibold text-slate-950">
              No people found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search or role filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => {
              const canEdit =
                data.canUpdate && user.id !== data.currentUserId;

              const canRemove =
                data.canDelete &&
                user.id !== data.currentUserId &&
                (user.roleKey !== "OWNER" || data.currentRole === "OWNER");

              return (
                <article
                  key={user.id}
                  className="relative overflow-visible rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/[0.05]"
                >
                  <div className="flex items-start gap-3">
                    <Avatar user={user} />

                    <div className="min-w-0 flex-1 pr-8">
                      <h3 className="truncate text-sm font-semibold text-slate-950">
                        {user.name}
                      </h3>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <div data-user-menu className="absolute right-3 top-3">
                      <Button
                        variant="ghost"
                        type="button"
                        aria-label={`Actions for ${user.name}`}
                        aria-expanded={menuId === user.id}
                        onClick={() =>
                          setMenuId((current) =>
                            current === user.id ? null : user.id,
                          )
                        }
                        className="h-9 w-9 rounded-xl p-0 text-slate-400 hover:text-slate-800"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {menuId === user.id && (
                        <div className="absolute right-0 top-10 z-40 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                setError(null);
                                setEditingUser(user);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <ShieldCheck className="h-4 w-4 text-slate-400" />
                              Change role
                            </button>
                          )}

                          {canRemove && (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                setRemovingUser(user);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              <UserRoundX className="h-4 w-4" />
                              Remove user
                            </button>
                          )}

                          {!canEdit && !canRemove && (
                            <div className="px-3 py-2.5 text-xs text-slate-400">
                              No actions available.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <RoleBadge role={user.roleKey} />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                        Joined
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {formatDate(user.joinedAt)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                        Access
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        Organization
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={data.pagination.totalItems}
          pageSize={data.pagination.pageSize}
          itemLabel="people"
        />
      </section>

      <UserFormDialog
        open={Boolean(editingUser)}
        user={editingUser}
        roles={data.roles}
        allowedRoleKeys={data.roles.map((role) => role.key)}
        isSubmitting={busy}
        error={error}
        onClose={() => {
          if (!busy) {
            setEditingUser(null);
            setError(null);
          }
        }}
        onSubmit={changeRole}
      />

      <UserRemoveDialog
        open={Boolean(removingUser)}
        userId={removingUser?.id ?? ""}
        userName={removingUser?.name ?? ""}
        onClose={() => setRemovingUser(null)}
        onSuccess={() => {
          if (removingUser) removeUser(removingUser.id);
        }}
      />
    </div>
  );
}
