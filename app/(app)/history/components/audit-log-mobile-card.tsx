"use client";

import {
  Activity,
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

export function AuditLogMobileCard({
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
    <article className="border-b border-slate-100 p-4 last:border-b-0">
      <button
        type="button"
        onClick={() =>
          onOpen(log)
        }
        className="w-full text-left"
      >
        <div className="flex gap-3">
          <div className="flex shrink-0 flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
              {initials(
                log.actor.name,
              )}
            </div>

            <div className="mt-2 h-full min-h-5 w-px bg-slate-200" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {log.actionLabel}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {log.actor.name}
                  {targetName
                    ? ` → ${targetName}`
                    : ""}
                </p>
              </div>

              <span className="shrink-0 text-[10px] font-medium text-slate-400">
                {formatDateTime(
                  log.createdAt,
                )}
              </span>
            </div>

            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
              {log.actionDescription}
            </p>

            {log.change && (
              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="truncate text-[11px] font-medium text-slate-500">
                  {log.change.from}
                </span>

                <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />

                <span className="truncate text-[11px] font-semibold text-slate-800">
                  {log.change.to}
                </span>
              </div>
            )}

            {!log.change && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                <Activity className="h-3 w-3" />
                {log.resourceLabel}
              </div>
            )}
          </div>
        </div>
      </button>
    </article>
  );
}