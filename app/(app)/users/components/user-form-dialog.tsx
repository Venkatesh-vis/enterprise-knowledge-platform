"use client";

import { useEffect, useState } from "react";

import { Select } from "@/app/shared/ui/select";

import type {
  UserListItem,
  UserRoleOption,
} from "@/lib/users/types";

type Props = {
  open: boolean;

  user: UserListItem | null;

  roles: UserRoleOption[];

  allowedRoleKeys: UserRoleOption["key"][];

  isSubmitting: boolean;

  error?: string | null;

  onClose: () => void;

  onSubmit: (
    userId: string,
    roleId: string,
  ) => Promise<boolean>;
};

export function UserFormDialog({
  open,
  user,
  roles,
  allowedRoleKeys,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [roleId, setRoleId] =
    useState("");

  useEffect(() => {
    if (!open || !user) {
      return;
    }


    setRoleId(user.roleId);


  }, [
    open,
    user,
  ]);

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

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

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

  if (!open || !user) {
    return null;
  }

  const availableRoles =
    roles.filter(
      (role) =>
        allowedRoleKeys.includes(
          role.key,
        ),
    );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    if (!user.id) {
      return;
    }

    if (!roleId) {
      return;
    }

    await onSubmit(
      user.id,
      roleId,
    );


  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/30 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    > <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-dialog-title"
      className="flex w-full max-w-lg max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    > <div className="shrink-0 border-b border-slate-100 px-6 py-5"> <h2
      id="user-dialog-title"
      className="text-base font-semibold text-slate-950"
    >
      Change role </h2>

          ```
          <p className="mt-1 text-sm text-slate-500">
            Update this user&apos;s
            organization role.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  User
                </span>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Organization role
                </span>

                <Select
                  value={roleId}
                  onValueChange={
                    setRoleId
                  }
                  options={availableRoles.map(
                    (role) => ({
                      value:
                        role.id,
                      label:
                        role.name,
                    }),
                  )}
                  aria-label="Organization role"
                  disabled={
                    isSubmitting
                  }
                />

                <span className="mt-2 block text-xs text-slate-400">
                  Roles are
                  system-defined.
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={onClose}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !roleId ||
                availableRoles.length ===
                0
              }
              className="cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>


  );
}
