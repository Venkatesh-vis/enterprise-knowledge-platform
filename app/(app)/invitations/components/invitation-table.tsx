"use client";

import { Eye, Mail, RefreshCw, ShieldCheck, UserRoundX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableScroll } from "@/app/shared/ui/table";
import type { InvitationListItem } from "@/lib/invitations/types";
import { formatDate, formatExpiry, getInitials } from "@/lib/invitations/utils";
import { InvitationStatusBadge } from "./invitation-status-badge";

type Props = {
  invitations: InvitationListItem[];
  canResend: boolean;
  canRevoke: boolean;
  onView: (item: InvitationListItem) => void;
  onResend: (item: InvitationListItem) => void;
  onRevoke: (item: InvitationListItem) => void;
};

function ActionButton({
  label,
  icon: Icon,
  danger = false,
  onClick,
}: {
  label: string;
  icon: typeof Eye;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

export function InvitationTable({ invitations, canResend, canRevoke, onView, onResend, onRevoke }: Props) {
  return (
    <TableScroll>
      <Table className="min-w-[980px]">
        <TableHeader>
          <tr>
            <TableHead>Invitee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="min-w-[240px] text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                    {getInitials(invitation.name, invitation.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{invitation.name || invitation.email}</p>
                    {invitation.name && <p className="truncate text-xs text-slate-500">{invitation.email}</p>}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  {invitation.roleName}
                </span>
              </TableCell>
              <TableCell><InvitationStatusBadge status={invitation.status} /></TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {invitation.sendCount} {invitation.sendCount === 1 ? "time" : "times"}
                </span>
              </TableCell>
              <TableCell>
                <p className="whitespace-nowrap text-sm text-slate-600">{formatDate(invitation.expiresAt)}</p>
                {invitation.status === "PENDING" && <p className="mt-0.5 whitespace-nowrap text-xs text-slate-400">{formatExpiry(invitation.expiresAt)}</p>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <ActionButton label="View" icon={Eye} onClick={() => onView(invitation)} />
                  {canResend && (invitation.status === "PENDING" || invitation.status === "EXPIRED") && (
                    <ActionButton label="Resend" icon={RefreshCw} onClick={() => onResend(invitation)} />
                  )}
                  {canRevoke && invitation.status === "PENDING" && (
                    <ActionButton label="Revoke" icon={UserRoundX} danger onClick={() => onRevoke(invitation)} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
