"use client";

import {
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

import type { AuditLogEntry } from "@/lib/audit/audit-types";

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",

      day: "numeric",
      month: "short",
      year: "numeric",

      hour: "numeric",
      minute: "2-digit",

      hour12: true,
    },
  ).format(
    new Date(value),
  );
}

function initials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "U";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts.at(-1)?.[0] ?? ""
  }`.toUpperCase();
}

export function AuditLogRow({
  log,
  onOpen,
}: {
  log: AuditLogEntry;
  onOpen: (
    log: AuditLogEntry,
  ) => void;
}) {
  const targetName =
    log.target?.name ??
    log.target?.email ??
    null;

  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
            {initials(
              log.actor.name,
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {log.actionLabel}
            </p>

            <p className="mt-1 max-w-[430px] text-xs leading-5 text-slate-500">
              {log.actionDescription}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {log.actor.name}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500">
            {log.actor.email}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        {targetName ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {targetName}
            </p>

            {log.target?.email &&
              log.target.name && (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {log.target.email}
                </p>
              )}
          </div>
        ) : (
          <span className="text-sm text-slate-400">
            —
          </span>
        )}
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {log.resourceLabel}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() =>
            onOpen(log)
          }
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>

        <p className="mt-1 text-[11px] text-slate-400">
          {formatDateTime(
            log.createdAt,
          )}
        </p>
      </td>
    </tr>
  );
}