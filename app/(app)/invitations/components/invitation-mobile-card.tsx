"use client";

import {
  Eye,
  RefreshCw,
  ShieldCheck,
  UserRoundX,
} from "lucide-react";

import type {
  InvitationListItem,
} from "@/lib/invitations/types";

import {
  formatDate,
  formatExpiry,
  getInitials,
} from "@/lib/invitations/utils";

import { InvitationStatusBadge } from "./invitation-status-badge";

type Props = {
  invitation: InvitationListItem;

  canResend: boolean;

  canRevoke: boolean;

  onView: (
    invitation: InvitationListItem,
  ) => void;

  onResend: (
    invitation: InvitationListItem,
  ) => void;

  onRevoke: (
    invitation: InvitationListItem,
  ) => void;
};

export function InvitationMobileCard({
  invitation,
  canResend,
  canRevoke,
  onView,
  onResend,
  onRevoke,
}: Props) {
  return (
    <article className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
          {getInitials(
            invitation.name,
            invitation.email,
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {invitation.name ||
              invitation.email}
          </p>

          {invitation.name && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {invitation.email}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <InvitationStatusBadge
              status={
                invitation.status
              }
            />

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />

              {
                invitation.roleName
              }
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
            Expires
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-700">
            {formatDate(
              invitation.expiresAt,
            )}
          </p>

          {invitation.status ===
            "PENDING" && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              {formatExpiry(
                invitation.expiresAt,
              )}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
            Sent
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-700">
            {invitation.sendCount}{" "}
            {invitation.sendCount ===
            1
              ? "time"
              : "times"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
        <MobileAction
          label="View"
          icon={Eye}
          onClick={() =>
            onView(
              invitation,
            )
          }
        />

        {canResend &&
          (invitation.status ===
            "PENDING" ||
            invitation.status ===
              "EXPIRED") && (
            <MobileAction
              label="Resend"
              icon={RefreshCw}
              onClick={() =>
                onResend(
                  invitation,
                )
              }
            />
          )}

        {canRevoke &&
          invitation.status ===
            "PENDING" && (
            <MobileAction
              label="Revoke"
              icon={UserRoundX}
              danger
              onClick={() =>
                onRevoke(
                  invitation,
                )
              }
            />
          )}
      </div>
    </article>
  );
}

function MobileAction({
  label,
  icon: Icon,
  onClick,
  danger = false,
}: {
  label: string;
  icon: typeof Eye;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />

      {label}
    </button>
  );
}