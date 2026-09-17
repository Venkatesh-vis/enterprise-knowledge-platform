"use client";

import { useState } from "react";

import type {
  UserDetailData,
  UserListItem,
  UserRoleOption,
} from "@/lib/users/types";

import { useUsersStore } from "@/app/shared/store/users-store";

import { UserFormDialog } from "../../components/user-form-dialog";

import { UserRemoveDialog } from "../../components/user-remove-dialog";

type Props = {
  user: UserListItem;

  roles: UserRoleOption[];

  allowedRoleKeys: UserRoleOption["key"][];

  canUpdate: boolean;

  canDelete: boolean;

  onUserUpdated: (
    user: UserListItem,
  ) => void;

  onPermissionsUpdated: (
    permissions: UserDetailData["permissions"],
  ) => void;
};

export function UserDetailActions({
  user,

  roles,

  allowedRoleKeys,

  canUpdate,

  canDelete,

  onUserUpdated,

  onPermissionsUpdated,
}: Props) {
  const updateRole =
    useUsersStore(
      (state) =>
        state.updateRole,
    );

  const [editing, setEditing] =
    useState(false);

  const [removing, setRemoving] =
    useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState<
      string | null
    >(null);

  async function handleRoleUpdate(
    userId: string,
    roleId: string,
  ): Promise<boolean> {
    if (!userId) {
      setError(
        "Target user ID is required.",
      );

      return false;
    }

    if (!roleId) {
      setError(
        "Target role ID is required.",
      );

      return false;
    }

    setIsSubmitting(true);

    setError(null);

    try {
      const result =
        await updateRole(
          userId,
          roleId,
        );

      if (!result) {
        return false;
      }

      onUserUpdated(
        result.user,
      );

      onPermissionsUpdated(
        result.permissions,
      );

      setEditing(false);

      return true;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update the user role.",
      );

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {canUpdate && (
          <button
            type="button"
            onClick={() => {
              setError(null);

              setEditing(true);
            }}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={() => {
              setError(null);

              setRemoving(true);
            }}
            className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Remove
          </button>
        )}
      </div>

      <UserFormDialog
        open={editing}
        user={user}
        roles={roles}
        allowedRoleKeys={
          allowedRoleKeys
        }
        isSubmitting={
          isSubmitting
        }
        error={error}
        onClose={() => {
          if (!isSubmitting) {
            setEditing(false);

            setError(null);
          }
        }}
        onSubmit={
          handleRoleUpdate
        }
      />

      <UserRemoveDialog
        open={removing}
        userId={user.id}
        userName={user.name}
        onClose={() => {
          setRemoving(false);
        }}
        onSuccess={() => {
          setRemoving(false);
        }}
      />
    </>
  );
}