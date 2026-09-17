"use client";

import { useState } from "react";

import { apiRequest } from "@/app/shared/lib/api";
import { Alert } from "@/app/shared/ui/alert";
import { Button } from "@/app/shared/ui/button";

type Props = {
  open: boolean;
  userId: string | null;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function UserRemoveDialog({
  open,
  userId,
  userName,
  onClose,
  onSuccess,
}: Props) {
  const [isRemoving, setIsRemoving] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!open || !userId) {
    return null;
  }

  async function handleRemove() {
    if (isRemoving) {
      return;
    }

    setError("");
    setIsRemoving(true);

    try {
      const response =
        await apiRequest<{
          success: boolean;
          message?: string;
        }>({
          path: `/api/users/${encodeURIComponent(
            userId,
          )}`,
          method: "DELETE",
        });

      if (!response.success) {
        throw new Error(
          response.message ??
            "Unable to remove this user.",
        );
      }

      onSuccess();
      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to remove this user.",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isRemoving
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-user-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="p-6">
          <h2
            id="remove-user-title"
            className="text-base font-semibold text-slate-950"
          >
            Remove user
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Remove{" "}
            <span className="font-semibold text-slate-700">
              {userName}
            </span>{" "}
            from this organization?
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Their organization access will be
            revoked and they will be signed out
            on their next authenticated request.
          </p>

          {error ? (
            <div className="mt-4">
              <Alert variant="error">
                {error}
              </Alert>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isRemoving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => void handleRemove()}
            disabled={isRemoving}
          >
            {isRemoving
              ? "Removing..."
              : "Remove user"}
          </Button>
        </div>
      </div>
    </div>
  );
}