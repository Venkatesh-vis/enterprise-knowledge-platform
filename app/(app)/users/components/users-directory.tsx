"use client";

import { Search, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/app/shared/lib/api";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Pagination } from "@/app/shared/ui/pagination";
import { Select } from "@/app/shared/ui/select";

import type { UserListItem, UsersDirectoryData } from "@/lib/users/types";

import { UserFormDialog } from "./user-form-dialog";
import { UserRemoveDialog } from "./user-remove-dialog";
import { UsersTable } from "./users-table";

type Props = UsersDirectoryData & {
  canUpdate: boolean;
  canDelete: boolean;
  currentUserId: string;
  currentRole: string;
};

type UsersResponse = {
  success: boolean;
  message?: string;
  data: UsersDirectoryData;
};

function buildUsersPath(search: string, roleId: string, page: number) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (roleId) params.set("roleId", roleId);
  params.set("page", String(page));
  params.set("pageSize", "20");

  return `/api/users?${params.toString()}`;
}

function updateRoleStats(
  stats: UsersDirectoryData["stats"],
  previousRole: string,
  nextRole: string,
) {
  if (previousRole === nextRole) return stats;

  const next = { ...stats };

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
}

export function UsersDirectory({
  users: initialUsers,
  roles,
  stats: initialStats,
  pagination: initialPagination,
  canUpdate,
  canDelete,
  currentUserId,
  currentRole,
}: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [stats, setStats] = useState(initialStats);
  const [pagination, setPagination] = useState(initialPagination);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [removingUser, setRemovingUser] = useState<UserListItem | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
    setStats(initialStats);
    setPagination(initialPagination);
  }, [initialUsers, initialStats, initialPagination]);

  async function loadUsers(nextSearch: string, nextRoleId: string, page: number) {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<UsersResponse>({
        path: buildUsersPath(nextSearch, nextRoleId, page),
        method: "GET",
      });

      if (!response.success) {
        throw new Error(response.message ?? "Unable to load users.");
      }

      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(nextSearch: string, nextRoleId: string) {
    setSearch(nextSearch);
    setRoleId(nextRoleId);
    void loadUsers(nextSearch, nextRoleId, 1);
  }

  function handlePageChange(page: number) {
    void loadUsers(search, roleId, page);
  }

  async function handleRoleUpdate(userId: string, nextRoleId: string) {
    setError(null);

    try {
      const response = await apiRequest<{
        success: boolean;
        message?: string;
        data: { user: UserListItem };
      }>({
        path: `/api/users/${encodeURIComponent(userId)}`,
        method: "PATCH",
        body: { roleId: nextRoleId },
      });

      if (!response.success) {
        throw new Error(response.message ?? "Unable to update user role.");
      }

      const updatedUser = response.data.user;
      const previousUser = users.find((user) => user.id === userId);

      setStats((current) =>
        updateRoleStats(
          current,
          previousUser?.roleKey ?? "",
          updatedUser.roleKey,
        ),
      );

      setUsers((current) => {
        const updated = current.map((user) =>
          user.id === userId ? updatedUser : user,
        );

        if (roleId && updatedUser.roleId !== roleId) {
          return updated.filter((user) => user.id !== userId);
        }

        return updated;
      });

      setEditingUser(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update user role.",
      );
    }
  }

  function handleUserRemoved(userId: string) {
    const removedUser = users.find((user) => user.id === userId);

    setUsers((current) => current.filter((user) => user.id !== userId));

    if (removedUser) {
      setStats((current) => ({
        ...updateRoleStats(current, removedUser.roleKey, ""),
        total: Math.max(0, current.total - 1),
      }));
    }

    setRemovingUser(null);

    if (users.length === 1 && pagination.page > 1) {
      handlePageChange(pagination.page - 1);
    }
  }

  const roleOptions = useMemo(
    () => [
      { value: "", label: "All roles" },
      ...roles.map((role) => ({ value: role.id, label: role.name })),
    ],
    [roles],
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">Organization</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Users
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage people, organization roles, and access for this workspace.
        </p>
      </header>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total users</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{stats.total}</p>
            </div>
            <UsersRound className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Administrators</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{stats.admins}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Managers</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{stats.managers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Members</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{stats.members}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters(searchInput.trim(), roleId);
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name or email"
                className="h-11 pl-10"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-11" disabled={loading}>
              Search
            </Button>
          </form>

          <Select
            value={roleId}
            onValueChange={(value) => applyFilters(searchInput.trim(), value)}
            options={roleOptions}
            aria-label="Filter by role"
            disabled={loading}
            className="w-full lg:w-52"
          />
        </div>

        {loading ? (
          <div className="px-5 py-3 text-xs text-slate-400">Updating users…</div>
        ) : null}

        <UsersTable
          users={users}
          roles={roles}
          currentUserId={currentUserId}
          currentUserRole={currentRole}
          canUpdate={canUpdate}
          canDelete={canDelete}
          mutationId={null}
          onChangeRole={setEditingUser}
          onRemove={setRemovingUser}
        />

        {pagination.totalPages > 1 ? (
          <div className="border-t border-slate-100 px-5 py-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : null}
      </section>

      <UserFormDialog
        open={Boolean(editingUser)}
        user={editingUser}
        roles={roles}
        allowedRoleKeys={roles.map((role) => role.key)}
        isSubmitting={false}
        error={error}
        onClose={() => setEditingUser(null)}
        onSubmit={handleRoleUpdate}
      />

      <UserRemoveDialog
        open={Boolean(removingUser)}
        userId={removingUser?.id ?? null}
        userName={removingUser?.name ?? ""}
        onClose={() => setRemovingUser(null)}
        onSuccess={() => {
          if (removingUser) handleUserRemoved(removingUser.id);
        }}
      />
    </div>
  );
}
