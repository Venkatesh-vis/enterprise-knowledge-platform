"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import type {
  InvitationListItem,
} from "@/lib/invitations/types";

import {
  formatDate,
  formatDateTime,
  formatExpiry,
  getInitials,
} from "@/lib/invitations/utils";

import { InvitationStatusBadge } from "./invitation-status-badge";

type Props = {
  open: boolean;

  invitation:
    | InvitationListItem
    | null;

  onClose: () => void;
};

export function InvitationDetailDialog({
  open,
  invitation,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    }

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    onClose,
  ]);

  if (!open || !invitation) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invitation-detail-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Invitation details
            </p>

            <h2
              id="invitation-detail-title"
              className="mt-1 text-lg font-semibold tracking-tight text-slate-950"
            >
              {invitation.name ||
                invitation.email}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
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

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {invitation.email}
              </p>
            </div>

            <InvitationStatusBadge
              status={
                invitation.status
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Role"
              value={
                invitation.roleName
              }
            />

            <DetailItem
              label="Invitation status"
              value={
                invitation.status
              }
            />

            <DetailItem
              label="Invited by"
              value={
                invitation.invitedByName
              }
            />

            <DetailItem
              label="Sent"
              value={`${invitation.sendCount} ${
                invitation.sendCount === 1
                  ? "time"
                  : "times"
              }`}
            />

            <DetailItem
              label="Created"
              value={formatDateTime(
                invitation.createdAt,
              )}
            />

            <DetailItem
              label="Last sent"
              value={formatDateTime(
                invitation.lastSentAt,
              )}
            />

            <DetailItem
              label="Expires"
              value={formatDateTime(
                invitation.expiresAt,
              )}
            />

            <DetailItem
              label="Time remaining"
              value={formatExpiry(
                invitation.expiresAt,
              )}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              What this means
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {getDetailDescription(
                invitation,
              )}
            </p>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3.5">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function getDetailDescription(
  invitation: InvitationListItem,
) {
  switch (invitation.status) {
    case "PENDING":
      return "This invitation is still active and can be used by the recipient to join the organization.";

    case "ACCEPTED":
      return "The recipient accepted this invitation and joined the organization.";

    case "EXPIRED":
      return "The invitation is no longer usable because it passed its expiration date. It can be resent as a fresh invitation.";

    case "REVOKED":
      return "This invitation was revoked and can no longer be used.";

    default:
      return "";
  }
}