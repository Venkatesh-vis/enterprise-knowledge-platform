"use client";

import {
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/app/shared/ui/button";

import type {
  InvitationAction,
  InvitationListItem,
} from "@/lib/invitations/types";

type Props = {
  open: boolean;

  action: InvitationAction;

  invitation:
    | InvitationListItem
    | null;

  isSubmitting: boolean;

  onClose: () => void;

  onConfirm: () => void;
};

export function InvitationActionDialog({
  open,
  action,
  invitation,
  isSubmitting,
  onClose,
  onConfirm,
}: Props) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isSubmitting
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
    isSubmitting,
    onClose,
  ]);

  if (!open || !invitation) {
    return null;
  }

  const isResend =
    action === "RESEND";

  const person =
    invitation.name ||
    invitation.email;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          if (!isSubmitting) {
            onClose();
          }
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between px-5 pt-5 sm:px-6">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isResend
                ? "bg-slate-100 text-slate-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isResend ? (
              <RefreshCw className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <h2 className="text-base font-semibold text-slate-950">
            {isResend
              ? "Resend invitation?"
              : "Revoke invitation?"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isResend
              ? `A fresh invitation email will be sent to ${person}. The current invitation expiry will be refreshed.`
              : `The invitation for ${person} will no longer be usable.`}
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">
              {person}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {invitation.email}
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10"
            >
              Cancel
            </Button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isResend
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isSubmitting
                ? isResend
                  ? "Resending..."
                  : "Revoking..."
                : isResend
                  ? "Resend invitation"
                  : "Revoke invitation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}