"use client";

import { useEffect } from "react";
import type { ComponentType } from "react";

import {
  Activity,
  ArrowRight,
  CalendarDays,
  UserRound,
  X,
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

      weekday: "long",
      day: "numeric",
      month: "long",
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

export function AuditDetailDialog({
  log,
  onClose,
}: {
  log: AuditLogEntry | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!log) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
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
  }, [log, onClose]);

  if (!log) {
    return null;
  }

  const targetName =
    log.target?.name ??
    log.target?.email ??
    "No specific person";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close activity details"
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-detail-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Activity className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Activity details
              </p>

              <h2
                id="audit-detail-title"
                className="mt-1 text-lg font-semibold tracking-tight text-slate-950"
              >
                {log.actionLabel}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {log.actionDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto">
          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Activity
              </p>

              <p className="mt-3 text-base font-medium leading-7 text-slate-900">
                {log.actionDescription}
              </p>
            </div>

            {log.change && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  What changed
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <ChangeValue
                    label={`Previous ${log.change.label.toLowerCase()}`}
                    value={
                      log.change.from
                    }
                  />

                  <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:flex">
                    <ArrowRight className="h-4 w-4" />
                  </div>

                  <ChangeValue
                    label={`New ${log.change.label.toLowerCase()}`}
                    value={
                      log.change.to
                    }
                  />
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                label={
                  log.change
                    ? "Changed by"
                    : "Done by"
                }
                icon={UserRound}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
                    {initials(
                      log.actor.name,
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {log.actor.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {log.actor.email}
                    </p>
                  </div>
                </div>
              </InfoCard>

              <InfoCard
                label="Person affected"
                icon={UserRound}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {targetName}
                  </p>

                  {log.target?.email &&
                    log.target.name && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {log.target.email}
                      </p>
                    )}
                </div>
              </InfoCard>
            </div>

            <InfoCard
              label="Date & time"
              icon={CalendarDays}
            >
              <p className="text-sm font-medium text-slate-800">
                {formatDateTime(
                  log.createdAt,
                )}
              </p>
            </InfoCard>
          </div>
        </div>

        <footer className="flex justify-end border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

function ChangeValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: ComponentType<{
    className?: string;
  }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <div className="mt-3">
        {children}
      </div>
    </div>
  );
}