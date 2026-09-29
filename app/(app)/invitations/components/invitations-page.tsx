"use client";

import { Clock3, MailCheck, MailPlus, MailWarning, Upload, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/app/shared/ui/button";
import { Pagination } from "@/app/shared/ui/pagination";
import type { Permission } from "@/app/shared/lib/permissions";
import type { CreateInvitationInput, InvitationListItem, InvitationPageData, InvitationRoleKey, InvitationStatus, ImportInvitationInput } from "@/lib/invitations/types";
import { addDays, createDummyInvitationId, getInvitableRoleKeys, getRoleLabel } from "@/lib/invitations/utils";
import { InvitationActionDialog } from "./invitation-action-dialog";
import { InvitationDetailDialog } from "./invitation-detail-dialog";
import { InvitationFilters } from "./invitation-filters";
import { InvitationFormDialog } from "./invitation-form-dialog";
import { InvitationImportDialog } from "./invitation-import-dialog";
import { InvitationTable } from "./invitation-table";

type Props = { data: InvitationPageData; permissions: Permission[]; currentUserName: string; currentRole: InvitationRoleKey };
const PAGE_SIZE = 8;

export function InvitationsPage({ data, permissions, currentUserName, currentRole }: Props) {
  const [invitations, setInvitations] = useState<InvitationListItem[]>(data.invitations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | "ALL">("ALL");
  const [roleFilter, setRoleFilter] = useState<InvitationRoleKey | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [detailInvitation, setDetailInvitation] = useState<InvitationListItem | null>(null);
  const [actionInvitation, setActionInvitation] = useState<InvitationListItem | null>(null);
  const [action, setAction] = useState<"RESEND" | "REVOKE" | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const canCreate = permissions.includes("INVITATION_CREATE") || permissions.includes("USER_INVITE");
  const canImport = permissions.includes("INVITATION_IMPORT");
  const canResend = permissions.includes("INVITATION_RESEND");
  const canRevoke = permissions.includes("INVITATION_REVOKE");
  const invitableRoles = getInvitableRoleKeys(currentRole);
  const stats = useMemo(() => ({ total: invitations.length, pending: invitations.filter((x) => x.status === "PENDING").length, accepted: invitations.filter((x) => x.status === "ACCEPTED").length, expired: invitations.filter((x) => x.status === "EXPIRED").length }), [invitations]);
  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    return invitations.filter((item) => (!value || item.email.toLowerCase().includes(value) || (item.name ?? "").toLowerCase().includes(value)) && (statusFilter === "ALL" || item.status === statusFilter) && (roleFilter === "ALL" || item.roleKey === roleFilter));
  }, [invitations, search, statusFilter, roleFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, filtered.length);
  const existingEmails = invitations.map((item) => item.email);

  function noticeMessage(type: "success" | "error", message: string) {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 3500);
  }

  function createInvitation(input: CreateInvitationInput) {
    const email = input.email.trim().toLowerCase();
    if (invitations.some((item) => item.email.toLowerCase() === email)) throw new Error("This email already has an invitation or membership.");
    if (!invitableRoles.includes(input.roleKey)) throw new Error("You are not allowed to assign this role.");
    const now = new Date();
    setInvitations((current) => [{ id: createDummyInvitationId(), email, name: input.name.trim() || null, roleKey: input.roleKey, roleName: getRoleLabel(input.roleKey), status: "PENDING", createdAt: now.toISOString(), expiresAt: addDays(now, 7).toISOString(), lastSentAt: now.toISOString(), invitedByName: currentUserName, sendCount: 1 }, ...current]);
    setCurrentPage(1);
    noticeMessage("success", `Invitation prepared for ${email}.`);
  }

  function importInvitations(inputs: ImportInvitationInput[]) {
    if (!inputs.length) throw new Error("No valid invitations were provided.");
    const existing = new Set(invitations.map((item) => item.email.toLowerCase()));
    const batch = new Set<string>();
    const now = new Date();
    const created = inputs.map((input) => {
      const email = input.email.trim().toLowerCase();
      if (existing.has(email) || batch.has(email)) throw new Error(`Duplicate invitation detected for ${email}.`);
      if (!invitableRoles.includes(input.roleKey)) throw new Error(`You cannot assign ${getRoleLabel(input.roleKey)}.`);
      batch.add(email);
      return { id: createDummyInvitationId(), email, name: input.name?.trim() || null, roleKey: input.roleKey, roleName: getRoleLabel(input.roleKey), status: "PENDING" as const, createdAt: now.toISOString(), expiresAt: addDays(now, 7).toISOString(), lastSentAt: now.toISOString(), invitedByName: currentUserName, sendCount: 1 };
    });
    setInvitations((current) => [...created, ...current]);
    setCurrentPage(1);
    noticeMessage("success", `${created.length} invitation${created.length === 1 ? "" : "s"} prepared successfully.`);
  }

  function openAction(type: "RESEND" | "REVOKE", item: InvitationListItem) {
    if (type === "RESEND" && (!canResend || !["PENDING", "EXPIRED"].includes(item.status))) return noticeMessage("error", "This invitation cannot be resent.");
    if (type === "REVOKE" && (!canRevoke || item.status !== "PENDING")) return noticeMessage("error", "Only pending invitations can be revoked.");
    setAction(type); setActionInvitation(item);
  }

  function confirmAction() {
    if (!action || !actionInvitation) return;
    setActionSubmitting(true);
    const id = actionInvitation.id;
    if (action === "RESEND") {
      const now = new Date();
      setInvitations((current) => current.map((item) => item.id === id ? { ...item, status: "PENDING", lastSentAt: now.toISOString(), expiresAt: addDays(now, 7).toISOString(), sendCount: item.sendCount + 1 } : item));
      noticeMessage("success", `Invitation resent to ${actionInvitation.email}.`);
    } else {
      setInvitations((current) => current.map((item) => item.id === id ? { ...item, status: "REVOKED" } : item));
      noticeMessage("success", `Invitation for ${actionInvitation.email} has been revoked.`);
    }
    setAction(null); setActionInvitation(null); setActionSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {notice && <div role="status" className={`rounded-xl border px-4 py-3 text-sm font-medium ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{notice.message}</div>}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-slate-500">{data.organization.name}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Invitations</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Invite people to your organization and manage pending access.</p></div>{(canCreate || canImport) && <div className="flex gap-2">{canImport && <Button variant="secondary" onClick={() => setShowImportDialog(true)}><Upload className="mr-2 h-4 w-4" />Bulk Invite</Button>}{canCreate && <Button onClick={() => setShowInviteDialog(true)}><MailPlus className="mr-2 h-4 w-4" />Invite member</Button>}</div>}</header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total invitations" value={stats.total} icon={Users} /><StatCard label="Pending" value={stats.pending} icon={Clock3} /><StatCard label="Accepted" value={stats.accepted} icon={MailCheck} /><StatCard label="Expired" value={stats.expired} icon={MailWarning} /></section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><InvitationFilters search={search} status={statusFilter} role={roleFilter} onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }} onStatusChange={(value) => { setStatusFilter(value); setCurrentPage(1); }} onRoleChange={(value) => { setRoleFilter(value); setCurrentPage(1); }} />{rows.length ? <><InvitationTable invitations={rows} canResend={canResend} canRevoke={canRevoke} onView={setDetailInvitation} onResend={(item) => openAction("RESEND", item)} onRevoke={(item) => openAction("REVOKE", item)} /><Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} itemLabel="invitations" onPageChange={setCurrentPage} /></> : <div className="px-6 py-16 text-center text-sm text-slate-500">No invitations found.</div>}</section>
      <InvitationFormDialog open={showInviteDialog} roles={invitableRoles} existingEmails={existingEmails} onClose={() => setShowInviteDialog(false)} onCreate={createInvitation} />
      <InvitationImportDialog open={showImportDialog} actorRole={currentRole} existingEmails={existingEmails} onClose={() => setShowImportDialog(false)} onImport={importInvitations} />
      <InvitationDetailDialog open={Boolean(detailInvitation)} invitation={detailInvitation} onClose={() => setDetailInvitation(null)} />
      <InvitationActionDialog open={Boolean(action && actionInvitation)} action={action ?? "RESEND"} invitation={actionInvitation} isSubmitting={actionSubmitting} onClose={() => { if (!actionSubmitting) { setAction(null); setActionInvitation(null); } }} onConfirm={confirmAction} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-medium text-slate-500">{label}</p><div className="mt-2 flex items-center justify-between"><p className="text-2xl font-semibold tabular-nums text-slate-950">{value}</p><Icon className="h-4 w-4 text-slate-400" /></div></div>;
}
