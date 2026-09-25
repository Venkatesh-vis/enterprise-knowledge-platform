"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShieldCheck, UsersRound, BriefcaseBusiness, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { UserListItem, UsersDirectoryData } from "@/lib/users/types";
import { apiRequest } from "@/app/shared/lib/api";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Select } from "@/app/shared/ui/select";
import { Pagination } from "@/app/shared/ui/pagination";
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

function updateQuery(pathname: string, current: string, changes: Record<string, string | null>) {
  const params = new URLSearchParams(current);
  Object.entries(changes).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function Avatar({ user }: { user: UserListItem }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
      {user.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : initials(user.name)}
    </div>
  );
}

export function UsersDirectoryModern({ data }: { data: UsersDirectoryData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState(data.users);
  const [stats, setStats] = useState(data.stats);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [removingUser, setRemovingUser] = useState<UserListItem | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setUsers(data.users), [data.users]);
  useEffect(() => setStats(data.stats), [data.stats]);
  useEffect(() => setSearch(searchParams.get("search") ?? ""), [searchParams]);

  const currentPage = data.pagination.page;
  const totalPages = data.pagination.totalPages;
  const roleId = searchParams.get("roleId") ?? "ALL";

  const roleOptions = useMemo(() => [
    { value: "ALL", label: "Every role" },
    ...data.roles.map((role) => ({ value: role.id, label: role.name })),
  ], [data.roles]);

  const navigate = (changes: Record<string, string | null>) => {
    setMenuId(null);
    router.push(updateQuery(pathname, searchParams.toString(), changes));
  };

  async function changeRole(userId: string, nextRoleId: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await apiRequest<{ success: boolean; message?: string; data: { user: UserListItem } }>({
        path: `/api/users/${encodeURIComponent(userId)}`,
        method: "PATCH",
        body: { roleId: nextRoleId },
      });
      if (!result.success) throw new Error(result.message || "Unable to update user role.");
      setUsers((current) => current.map((user) => user.id === userId ? result.data.user : user));
      setEditingUser(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update user role.");
    } finally {
      setBusy(false);
    }
  }

  function removeUser(userId: string) {
    setUsers((current) => current.filter((user) => user.id !== userId));
    setRemovingUser(null);
    router.refresh();
    if (users.length === 1 && currentPage > 1) navigate({ page: String(currentPage - 1) });
  }

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 px-6 py-7 shadow-sm">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-slate-100 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
              <UsersRound className="h-3.5 w-3.5" /> People & access
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">People</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Manage the people in your organization, their roles, and access.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace members</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">{stats.total}</p>
          </div>
        </div>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat icon={ShieldCheck} label="Administrators" value={stats.admins} />
        <Stat icon={BriefcaseBusiness} label="Managers" value={stats.managers} />
        <Stat icon={UsersRound} label="Members" value={stats.members} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Team directory</h2>
            <p className="mt-1 text-sm text-slate-500">Find a person and manage their organization role.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") navigate({ search: search.trim() || null, page: "1" }); }} placeholder="Search people..." className="h-11 rounded-xl bg-white pl-10" />
            </div>
            <Select value={roleId} onValueChange={(value) => navigate({ roleId: value === "ALL" ? null : value, page: "1" })} options={roleOptions} aria-label="Filter people by role" className="sm:w-48" />
          </div>
        </div>

        {users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <UsersRound className="mx-auto h-7 w-7 text-slate-400" />
            <h3 className="mt-4 text-base font-semibold text-slate-950">No people found</h3>
            <p className="mt-1 text-sm text-slate-500">Try a different search or role filter.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <article key={user.id} className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/[0.05]">
                <div className="flex items-start gap-3">
                  <Link href={`/users/${user.id}`}><Avatar user={user} /></Link>
                  <div className="min-w-0 flex-1 pr-7">
                    <Link href={`/users/${user.id}`} className="block truncate text-sm font-semibold text-slate-950 hover:text-slate-600">{user.name}</Link>
                    <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <button type="button" aria-label={`Actions for ${user.name}`} aria-expanded={menuId === user.id} onClick={() => setMenuId(menuId === user.id ? null : user.id)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <RoleBadge role={user.roleKey} />
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active</span>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">Joined {formatDate(user.joinedAt)}</div>

                {menuId === user.id && (
                  <div className="absolute right-4 top-12 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl" onPointerDown={(event) => event.stopPropagation()}>
                    <Link href={`/users/${user.id}`} onClick={() => setMenuId(null)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">View profile</Link>
                    {data.canUpdate && user.id !== data.currentUserId && <button type="button" onClick={() => { setMenuId(null); setEditingUser(user); }} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">Change role</button>}
                    {data.canDelete && user.id !== data.currentUserId && (user.roleKey !== "OWNER" || data.currentRole === "OWNER") && <button type="button" onClick={() => { setMenuId(null); setRemovingUser(user); }} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">Remove</button>}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <Pagination page={currentPage} totalPages={totalPages} totalItems={data.pagination.totalItems} pageSize={data.pagination.pageSize} itemLabel="people" />
      </section>

      <UserFormDialog
        open={Boolean(editingUser)}
        user={editingUser}
        roles={data.roles}
        allowedRoleKeys={data.roles.map((role) => role.key)}
        isSubmitting={busy}
        error={error}
        onClose={() => { if (!busy) { setEditingUser(null); setError(null); } }}
        onSubmit={changeRole}
      />

      <UserRemoveDialog
        open={Boolean(removingUser)}
        userId={removingUser?.id ?? ""}
        userName={removingUser?.name ?? ""}
        onClose={() => setRemovingUser(null)}
        onSuccess={() => { if (removingUser) removeUser(removingUser.id); }}
      />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof UsersRound; label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">{value}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500"><Icon className="h-4 w-4" /></div></div></div>;
}
