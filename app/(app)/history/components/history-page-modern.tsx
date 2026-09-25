"use client";

import { Activity, CalendarClock, Clock3, ShieldCheck, UsersRound } from "lucide-react";
import { useState } from "react";

import type { AuditLogDirectoryData, AuditLogEntry } from "@/lib/audit/audit-types";
import { Pagination } from "@/app/shared/ui/pagination";
import { HistoryFilters } from "./history-filters";
import { AuditDetailDialog } from "./audit-detail-dialog";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function HistoryPageModern({ data }: { data: AuditLogDirectoryData }) {
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const hasFilters = Boolean(data.filters.search || data.filters.action || data.filters.resource || data.filters.actorUserId || data.filters.from || data.filters.to);

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 px-6 py-7 shadow-sm">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-slate-100 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm"><ShieldCheck className="h-3.5 w-3.5" /> Security & compliance</div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Activity</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">A chronological view of important actions across your organization.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recorded events</p><p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">{data.pagination.totalItems.toLocaleString("en-IN")}</p></div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Activity} label="Total events" value={data.stats.totalEvents} />
        <Stat icon={Clock3} label="Last 24 hours" value={data.stats.last24Hours} />
        <Stat icon={CalendarClock} label="Last 7 days" value={data.stats.last7Days} />
        <Stat icon={UsersRound} label="Unique actors" value={data.stats.uniqueActors} />
      </section>

      <HistoryFilters filters={data.filters} actors={data.actors} />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div><h2 className="text-base font-semibold text-slate-950">Recent activity</h2><p className="mt-1 text-xs text-slate-500">{hasFilters ? "Filtered organization activity." : "Latest events appear first."}</p></div>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">Page {data.pagination.page} / {data.pagination.totalPages}</span>
        </div>

        {data.logs.length === 0 ? (
          <div className="px-6 py-16 text-center"><Activity className="mx-auto h-7 w-7 text-slate-400" /><h3 className="mt-4 text-base font-semibold text-slate-950">{hasFilters ? "No matching activity" : "No activity yet"}</h3><p className="mt-1 text-sm text-slate-500">{hasFilters ? "Try removing a filter or broadening the date range." : "Recorded organization activity will appear here."}</p></div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-5 left-[21px] top-5 w-px bg-slate-200" />
            <div className="space-y-2">
              {data.logs.map((log) => <ActivityItem key={log.id} log={log} onOpen={setSelectedLog} />)}
            </div>
          </div>
        )}

        <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} totalItems={data.pagination.totalItems} pageSize={data.pagination.pageSize} itemLabel="events" />
      </section>

      <AuditDetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}

function ActivityItem({ log, onOpen }: { log: AuditLogEntry; onOpen: (log: AuditLogEntry) => void }) {
  const target = log.target?.name ?? log.target?.email;

  return (
    <button type="button" onClick={() => onOpen(log)} className="group relative flex w-full gap-4 rounded-2xl p-3 text-left transition hover:bg-slate-50 sm:p-4">
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-[11px] font-bold text-white ring-4 ring-white">{initials(log.actor.name)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-950">{log.actionLabel}</p><p className="mt-0.5 text-xs text-slate-500">{log.actor.name}{target ? ` → ${target}` : ""}</p></div>
          <time className="shrink-0 text-[11px] font-medium text-slate-400">{formatDateTime(log.createdAt)}</time>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{log.actionDescription}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{log.resourceLabel}</span>
          {log.change && <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{log.change.from} → {log.change.to}</span>}
        </div>
      </div>
    </button>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">{value.toLocaleString("en-IN")}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500"><Icon className="h-4 w-4" /></div></div></div>;
}
