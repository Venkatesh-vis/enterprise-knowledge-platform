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
  invitations: InvitationListItem[];

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

export function InvitationTable({
  invitations,
  canResend,
  canRevoke,
  onView,
  onResend,
  onRevoke,
}: Props) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Person
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Role
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Status
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Expires
            </th>

            <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Sent
            </th>

            <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {invitations.map(
            (invitation) => (
              <tr
                key={
                  invitation.id
                }
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {getInitials(
                        invitation.name,
                        invitation.email,
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {invitation.name ||
                          invitation.email}
                      </p>

                      {invitation.name && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {
                            invitation.email
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />

                    {
                      invitation.roleName
                    }
                  </span>
                </td>

                <td className="px-5 py-4">
                  <InvitationStatusBadge
                    status={
                      invitation.status
                    }
                  />
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm text-slate-600">
                      {formatDate(
                        invitation.expiresAt,
                      )}
                    </p>

                    {invitation.status ===
                      "PENDING" && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatExpiry(
                          invitation.expiresAt,
                        )}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-600">
                    {invitation.sendCount}{" "}
                    {invitation.sendCount ===
                    1
                      ? "time"
                      : "times"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDate(
                      invitation.lastSentAt,
                    )}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <ActionButton
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
                        <ActionButton
                          label="Resend"
                          icon={
                            RefreshCw
                          }
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
                        <ActionButton
                          label="Revoke"
                          icon={
                            UserRoundX
                          }
                          danger
                          onClick={() =>
                            onRevoke(
                              invitation,
                            )
                          }
                        />
                      )}
                  </div>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function ActionButton({
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
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />

      {label}
    </button>
  );
}