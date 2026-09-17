"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  UserDetailData,
  UserListItem,
} from "@/lib/users/types";

import { RoleBadge } from "../../components/role-badge";

import { UserDetailActions } from "./user-detail-actions";

type Props = {
  data: UserDetailData;
};

function initials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts.at(-1)?.[0] ?? ""
  }`.toUpperCase();
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

export function UserDetailClient({
  data,
}: Props) {
  const [user, setUser] =
    useState<UserListItem>(
      data.user,
    );

  const [
    permissions,
    setPermissions,
  ] = useState<
    UserDetailData["permissions"]
  >(data.permissions);

  return (
    <div className="space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>

        Back to Users
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
        <div className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-slate-700 ring-1 ring-slate-200">
                {initials(
                  user.name,
                )}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950">
                  {user.name}
                </h1>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {user.email}
                </p>

                <div className="mt-3">
                  <RoleBadge
                    role={
                      user.roleKey
                    }
                  />
                </div>
              </div>
            </div>

            <UserDetailActions
              user={user}
              roles={data.roles}
              allowedRoleKeys={
                data.allowedRoleKeys
              }
              canUpdate={
                data.canUpdate
              }
              canDelete={
                data.canDelete
              }
              onUserUpdated={
                setUser
              }
              onPermissionsUpdated={
                setPermissions
              }
            />
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-400">
              Email
            </div>

            <p className="mt-2 break-all text-sm font-medium text-slate-800">
              {user.email}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-400">
              Organization role
            </div>

            <div className="mt-2">
              <RoleBadge
                role={
                  user.roleKey
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-400">
              Joined
            </div>

            <p className="mt-2 text-sm font-medium text-slate-800">
              {formatDate(
                user.joinedAt,
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="text-base font-semibold text-slate-950">
            Permissions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Permissions inherited
            from the user&apos;s
            current organization
            role.
          </p>
        </div>

        {permissions.length ===
        0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 sm:px-8">
            This role has no
            permissions.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-6 sm:p-8">
            {permissions.map(
              (
                permission,
              ) => (
                <span
                  key={
                    permission.key
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  {
                    permission.name
                  }
                </span>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}