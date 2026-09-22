"use client";

import {
  Activity,
  CalendarClock,
  Clock3,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  ComponentType,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import type {
  AuditLogDirectoryData,
  AuditLogEntry,
} from "@/lib/audit/audit-types";

import {
  AuditDetailDialog,
} from "./audit-detail-dialog";

import {
  AuditLogMobileCard,
} from "./audit-log-mobile-card";

import {
  AuditLogRow,
} from "./audit-log-row";

import {
  HistoryFilters,
} from "./history-filters";

import {
  HistoryPagination,
} from "./history-pagination";

export function HistoryPage({
  data,
}: {
  data: AuditLogDirectoryData;
}) {
  const searchParams =
    useSearchParams();

  const [
    selectedLog,
    setSelectedLog,
  ] =
    useState<AuditLogEntry | null>(
      null,
    );

  const hasFilters =
    Boolean(
      data.filters.search ||
        data.filters.action ||
        data.filters.resource ||
        data.filters.actorUserId ||
        data.filters.from ||
        data.filters.to,
    );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />

            Security & compliance
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            History
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review administrative and security activity across your organization.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm sm:self-auto">
          <Activity className="h-4 w-4 text-slate-400" />

          {data.pagination.totalItems.toLocaleString(
            "en-IN",
          )}{" "}
          matching events
        </div>
      </header>

      <section
        aria-label="Audit history statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total events"
          value={
            data.stats.totalEvents
          }
          icon={Activity}
          description="All recorded organization activity"
        />

        <StatCard
          label="Last 24 hours"
          value={
            data.stats.last24Hours
          }
          icon={Clock3}
          description="Recent activity in the workspace"
        />

        <StatCard
          label="Last 7 days"
          value={
            data.stats.last7Days
          }
          icon={CalendarClock}
          description="Activity recorded this week"
        />

        <StatCard
          label="Unique actors"
          value={
            data.stats.uniqueActors
          }
          icon={UsersRound}
          description="People who generated activity"
        />
      </section>

      <HistoryFilters
        filters={
          data.filters
        }
        actors={data.actors}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
        <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Activity log
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {hasFilters
                ? "Results matching the selected filters."
                : "Most recent organization activity appears first."}
            </p>
          </div>

          {data.pagination
            .totalItems > 0 && (
            <span className="text-xs font-medium text-slate-400">
              Page{" "}
              {
                data.pagination
                  .page
              }{" "}
              of{" "}
              {
                data.pagination
                  .totalPages
              }
            </span>
          )}
        </div>

        {data.logs.length === 0 ? (
          <EmptyHistoryState
            hasFilters={
              hasFilters
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-white">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Activity
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Actor
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Target
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Resource
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Recorded
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.logs.map(
                    (log) => (
                      <AuditLogRow
                        key={log.id}
                        log={log}
                        onOpen={
                          setSelectedLog
                        }
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {data.logs.map(
                (log) => (
                  <AuditLogMobileCard
                    key={log.id}
                    log={log}
                    onOpen={
                      setSelectedLog
                    }
                  />
                ),
              )}
            </div>

            <HistoryPagination
              page={
                data.pagination
                  .page
              }
              totalPages={
                data.pagination
                  .totalPages
              }
              totalItems={
                data.pagination
                  .totalItems
              }
              pageSize={
                data.pagination
                  .pageSize
              }
              searchParams={searchParams.toString()}
            />
          </>
        )}
      </section>

      <AuditDetailDialog
        log={selectedLog}
        onClose={() =>
          setSelectedLog(null)
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">
            {value.toLocaleString(
              "en-IN",
            )}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function EmptyHistoryState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="p-12 text-center sm:p-16">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Activity className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-950">
        {hasFilters
          ? "No matching activity"
          : "No activity yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try removing a filter or broadening the date range to find more activity."
          : "Once administrative activity is recorded, it will appear here in reverse chronological order."}
      </p>
    </div>
  );
}