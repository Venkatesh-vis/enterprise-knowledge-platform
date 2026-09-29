"use client";

import Link from "next/link";
import type { UserListItem, UserRoleOption } from "@/lib/users/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableScroll } from "@/app/shared/ui/table";
import { RoleBadge } from "./role-badge";

type Props = { users: UserListItem[]; roles: UserRoleOption[]; currentUserId: string; currentUserRole: string; canUpdate: boolean; canDelete: boolean; mutationId: string | null; onChangeRole: (user: UserListItem) => void; onRemove: (user: UserListItem) => void };
const initials = (name: string) => { const p = name.trim().split(/\s+/).filter(Boolean); return !p.length ? "U" : p.length === 1 ? p[0].slice(0, 2).toUpperCase() : `${p[0][0]}${p.at(-1)?.[0] ?? ""}`.toUpperCase(); };
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const canManageOwner = (current: string, target: string) => target !== "OWNER" || current === "OWNER";

export function UsersTableV2({ users, currentUserId, currentUserRole, canUpdate, canDelete, mutationId, onChangeRole, onRemove }: Props) {
  if (!users.length) return <div className="px-6 py-16 text-center text-sm text-slate-500">No users found. Try changing your search or role filter.</div>;
  return <TableScroll><Table className="min-w-[820px]"><TableHeader><tr><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></tr></TableHeader><TableBody>{users.map((user) => { const self = user.id === currentUserId; const busy = mutationId === user.id; const manageable = canManageOwner(currentUserRole, user.roleKey); return <TableRow key={user.id}><TableCell><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{initials(user.name)}</div><div className="min-w-0"><Link href={`/users/${user.id}`} className="block truncate font-semibold text-slate-950 hover:underline">{user.name}</Link><p className="truncate text-xs text-slate-500">{user.email}</p></div></div></TableCell><TableCell><RoleBadge role={user.roleKey} /></TableCell><TableCell className="whitespace-nowrap text-sm text-slate-500">{formatDate(user.joinedAt)}</TableCell><TableCell><div className="flex justify-end gap-1"><Link href={`/users/${user.id}`} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">View</Link>{canUpdate && !self && manageable && <button type="button" disabled={busy} onClick={() => onChangeRole(user)} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">{busy ? "Updating..." : "Change role"}</button>}{canDelete && !self && manageable && <button type="button" disabled={busy} onClick={() => onRemove(user)} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Remove</button>}</div></TableCell></TableRow>; })}</TableBody></Table></TableScroll>;
}
