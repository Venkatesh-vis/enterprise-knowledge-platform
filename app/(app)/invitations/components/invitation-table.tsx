"use client";

import { Eye, Mail, RefreshCw, ShieldCheck, UserRoundX } from "lucide-react";
import type { InvitationListItem } from "@/lib/invitations/types";
import { formatDate, formatExpiry, getInitials } from "@/lib/invitations/utils";
import { InvitationStatusBadge } from "./invitation-status-badge";

type Props = {
  invitations: InvitationListItem[];
  canResend: boolean;
  canRevoke: boolean;
  onView: (invitation: InvitationListItem) => void;
  onResend: (invitation: InvitationListItem) => void;
  onRevoke: (invitation: InvitationListItem) => void;
};

export function InvitationTable({ invitations, canResend, canRevoke, onView, onResend, onRevoke }: Props) {
  return (
    <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
      {invitations.map((invitation) => (
        <article key={invitation.id} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/[0.05]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
              {getInitials(invitation.name, invitation.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950">{invitation.name || invitation.email}</p>
              {invitation.name && <p className="mt-1 truncate text-xs text-slate-500">{invitation.email}</p>}
            </div>
            <InvitationStatusBadge status={invitation.status} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Info label="Role" value={invitation.roleName} icon={<ShieldCheck className="h-3.5 w-3.5" />} />
            <Info label="Sent" value={`${invitation.sendCount} ${invitation.sendCount === 1 ? "time" : "times"}`} icon={<Mail className="h-3.5 w-3.5" />} />
          </div>

          <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invitation expiry</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{formatDate(invitation.expiresAt)}</p>
            {invitation.status === "PENDING" && <p className="mt-0.5 text-[11px] text-slate-400">{formatExpiry(invitation.expiresAt)}</p>}
          </div>

          <div className="mt-4 flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
            <ActionButton label="View" icon={Eye} onClick={() => onView(invitation)} />
            {canResend && (invitation.status === "PENDING" || invitation.status === "EXPIRED") && <ActionButton label="Resend" icon={RefreshCw} onClick={() => onResend(invitation)} />}
            {canRevoke && invitation.status === "PENDING" && <ActionButton label="Revoke" icon={UserRoundX} danger onClick={() => onRevoke(invitation)} />}
          </div>
        </article>
      ))}
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5"><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{icon}{label}</div><p className="mt-1 truncate text-xs font-semibold text-slate-700">{value}</p></div>;
}

function ActionButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: typeof Eye; onClick: () => void; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}><Icon className="h-3.5 w-3.5" />{label}</button>;
}
