"use client";

import { Eye, Mail, RefreshCw, ShieldCheck, UserRoundX } from "lucide-react";
import type { InvitationListItem } from "@/lib/invitations/types";
import { formatDate, formatExpiry, getInitials } from "@/lib/invitations/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableScroll } from "@/app/shared/ui/table";
import { InvitationStatusBadge } from "./invitation-status-badge";

type Props = { invitations: InvitationListItem[]; canResend: boolean; canRevoke: boolean; onView: (item: InvitationListItem) => void; onResend: (item: InvitationListItem) => void; onRevoke: (item: InvitationListItem) => void };

export function InvitationTable({ invitations, canResend, canRevoke, onView, onResend, onRevoke }: Props) {
  return (
    <TableScroll>
      <Table className="min-w-[920px]">
        <TableHeader><tr><TableHead>Invitee</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Sent</TableHead><TableHead>Expires</TableHead><TableHead className="text-right">Actions</TableHead></tr></TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">{getInitials(invitation.name, invitation.email)}</div>
                  <div className="min-w-0"><p className="truncate font-semibold text-slate-950">{invitation.name || invitation.email}</p>{invitation.name && <p className="truncate text-xs text-slate-500">{invitation.email}</p>}</div>
                </div>
              </TableCell>
              <TableCell><span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600"><ShieldCheck className="h-3.5 w-3.5 text-slate-400" />{invitation.roleName}</span></TableCell>
              <TableCell><InvitationStatusBadge status={invitation.status} /></TableCell>
              <TableCell><span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" />{invitation.sendCount} {invitation.sendCount === 1 ? "time" : "times"}</span></TableCell>
              <TableCell><p className="text-sm text-slate-600">{formatDate(invitation.expiresAt)}</p>{invitation.status === "PENDING" && <p className="mt-0.5 text-xs text-slate-400">{formatExpiry(invitation.expiresAt)}</p>}</TableCell>
              <TableCell><div className="flex items-center justify-end gap-1"><button type="button" onClick={() => onView(invitation)} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"><Eye className="mr-1.5 inline h-3.5 w-3.5" />View</button>{canResend && (invitation.status === "PENDING" || invitation.status === "EXPIRED") && <button type="button" onClick={() => onResend(invitation)} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"><RefreshCw className="mr-1.5 inline h-3.5 w-3.5" />Resend</button>}{canRevoke && invitation.status === "PENDING" && <button type="button" onClick={() => onRevoke(invitation)} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><UserRoundX className="mr-1.5 inline h-3.5 w-3.5" />Revoke</button>}</div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
