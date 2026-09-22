"use client";

import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Input } from "@/app/shared/ui/input";
import { Select } from "@/app/shared/ui/select";

import type {
  InvitationStatus,
  InvitationRoleKey,
} from "@/lib/invitations/types";

type Props = {
  search: string;

  status: InvitationStatus | "ALL";

  role: InvitationRoleKey | "ALL";

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: InvitationStatus | "ALL",
  ) => void;

  onRoleChange: (
    value: InvitationRoleKey | "ALL",
  ) => void;
};

const STATUS_OPTIONS = [
  {
    value: "ALL",
    label: "All statuses",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "ACCEPTED",
    label: "Accepted",
  },
  {
    value: "EXPIRED",
    label: "Expired",
  },
  {
    value: "REVOKED",
    label: "Revoked",
  },
];

const ROLE_OPTIONS = [
  {
    value: "ALL",
    label: "All roles",
  },
  {
    value: "OWNER",
    label: "Owners",
  },
  {
    value: "ADMIN",
    label: "Administrators",
  },
  {
    value: "MANAGER",
    label: "Managers",
  },
  {
    value: "MEMBER",
    label: "Members",
  },
];

export function InvitationFilters({
  search,
  status,
  role,
  onSearchChange,
  onStatusChange,
  onRoleChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Search by name or email"
          className="h-11 pl-10"
          aria-label="Search invitations"
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="hidden h-4 w-4 text-slate-400 sm:block" />

        <div className="w-full sm:w-44">
          <Select
            value={status}
            onValueChange={(value) =>
              onStatusChange(
                value as
                  | InvitationStatus
                  | "ALL",
              )
            }
            options={STATUS_OPTIONS}
            aria-label="Filter invitations by status"
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            value={role}
            onValueChange={(value) =>
              onRoleChange(
                value as
                  | InvitationRoleKey
                  | "ALL",
              )
            }
            options={ROLE_OPTIONS}
            aria-label="Filter invitations by role"
          />
        </div>
      </div>
    </div>
  );
}