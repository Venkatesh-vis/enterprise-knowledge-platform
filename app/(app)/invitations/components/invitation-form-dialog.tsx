"use client";

import { MailPlus, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { z } from "zod";

import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Select } from "@/app/shared/ui/select";

import type {
  CreateInvitationInput,
  InvitationRoleKey,
} from "@/lib/invitations/types";

import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  normalizeEmail,
} from "@/lib/invitations/utils";

const schema =
  z.object({
    email: z
      .string()
      .trim()
      .email(
        "Enter a valid email address.",
      ),

    name: z
      .string()
      .trim()
      .max(
        100,
        "Name must be 100 characters or less.",
      ),

    roleKey: z.enum([
      "OWNER",
      "ADMIN",
      "MANAGER",
      "MEMBER",
    ]),
  });

type Props = {
  open: boolean;

  roles: InvitationRoleKey[];

  existingEmails: string[];

  onClose: () => void;

  onCreate: (
    input: CreateInvitationInput,
  ) => void;
};

export function InvitationFormDialog({
  open,
  roles,
  existingEmails,
  onClose,
  onCreate,
}: Props) {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    roleKey,
    setRoleKey,
  ] = useState<InvitationRoleKey>(
    roles[0] ?? "MEMBER",
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setEmail("");
    setName("");
    setRoleKey(
      roles[0] ?? "MEMBER",
    );
    setError("");

    const timer =
      window.setTimeout(() => {
        document
          .getElementById(
            "invitation-email",
          )
          ?.focus();
      }, 50);

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [open, roles]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        onClose();
      }
    };

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

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role,
        label:
          ROLE_LABELS[role],
      })),
    [roles],
  );

  if (!open) {
    return null;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const result =
      schema.safeParse({
        email,
        name,
        roleKey,
      });

    if (!result.success) {
      setError(
        result.error.issues[0]
          ?.message ??
          "Please check the form.",
      );

      return;
    }

    const normalizedEmail =
      normalizeEmail(email);

    const duplicate =
      existingEmails.some(
        (existingEmail) =>
          normalizeEmail(
            existingEmail,
          ) === normalizedEmail,
      );

    if (duplicate) {
      setError(
        "This email already has an invitation or membership in this organization.",
      );

      return;
    }

    if (!roles.includes(roleKey)) {
      setError(
        "You are not allowed to assign this role.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      onCreate({
        email:
          normalizedEmail,

        name:
          name.trim(),

        roleKey,
      });

      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create the invitation.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedRole =
    ROLE_DESCRIPTIONS[
      roleKey
    ];

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
        aria-labelledby="invitation-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <MailPlus className="h-4 w-4" />
              </div>

              <div>
                <h2
                  id="invitation-dialog-title"
                  className="text-base font-semibold text-slate-950"
                >
                  Invite a member
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Send an invitation to
                  join your organization.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="invitation-email"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              Email address
            </label>

            <Input
              id="invitation-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="person@example.com"
              autoComplete="email"
              disabled={
                isSubmitting
              }
              className="h-11"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              The invitation will be
              sent to this address.
            </p>
          </div>

          <div>
            <label
              htmlFor="invitation-name"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              Name
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <Input
              id="invitation-name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="e.g. Priya Sharma"
              autoComplete="name"
              disabled={
                isSubmitting
              }
              className="h-11"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Role
            </label>

            <Select
              value={roleKey}
              onValueChange={(value) =>
                setRoleKey(
                  value as InvitationRoleKey,
                )
              }
              options={roleOptions}
              aria-label="Invitation role"
            />

            <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-semibold text-slate-700">
                {ROLE_LABELS[roleKey]}
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {selectedRole}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting
              }
              className="h-10"
            >
              {isSubmitting
                ? "Sending..."
                : "Send invitation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}