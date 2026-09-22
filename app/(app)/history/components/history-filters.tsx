"use client";

import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Button,
} from "@/app/shared/ui/button";

import {
  Input,
} from "@/app/shared/ui/input";

import {
  Select,
} from "@/app/shared/ui/select";

import {
  AUDIT_ACTIONS,
  AUDIT_ACTION_META,
  AUDIT_RESOURCE_LABELS,
} from "@/lib/audit/audit-actions";

import type {
  AuditActorOption,
  AuditLogFilters,
} from "@/lib/audit/audit-types";

function buildUrl(
  pathname: string,
  currentParams: URLSearchParams,
  changes: Record<
    string,
    string | null
  >,
) {
  const params =
    new URLSearchParams(
      currentParams,
    );

  for (const [
    key,
    value,
  ] of Object.entries(
    changes,
  )) {
    if (!value) {
      params.delete(
        key,
      );
    } else {
      params.set(
        key,
        value,
      );
    }
  }

  const query =
    params.toString();

  return query
    ? `${pathname}?${query}`
    : pathname;
}

export function HistoryFilters({
  filters,
  actors,
}: {
  filters: AuditLogFilters;

  actors: AuditActorOption[];
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [
    search,
    setSearch,
  ] = useState(
    filters.search,
  );

  const [
    from,
    setFrom,
  ] = useState(
    filters.from,
  );

  const [
    to,
    setTo,
  ] = useState(
    filters.to,
  );

  useEffect(() => {
    setSearch(
      filters.search,
    );

    setFrom(
      filters.from,
    );

    setTo(
      filters.to,
    );
  }, [
    filters.search,
    filters.from,
    filters.to,
  ]);

  const actionOptions =
    useMemo(
      () => [
        {
          value: "",
          label:
            "All activities",
        },

        ...AUDIT_ACTIONS.map(
          (action) => ({
            value: action,

            label:
              AUDIT_ACTION_META[
                action
              ].label,
          }),
        ),
      ],
      [],
    );

  const resourceOptions =
    useMemo(
      () => [
        {
          value: "",
          label:
            "All resources",
        },

        ...Object.entries(
          AUDIT_RESOURCE_LABELS,
        ).map(
          ([
            value,
            label,
          ]) => ({
            value,
            label,
          }),
        ),
      ],
      [],
    );

  const actorOptions =
    useMemo(
      () => [
        {
          value: "",
          label:
            "All actors",
        },

        ...actors.map(
          (actor) => ({
            value: actor.id,

            label: `${actor.name} · ${actor.email}`,
          }),
        ),
      ],
      [actors],
    );

  const hasFilters =
    Boolean(
      filters.search ||
        filters.action ||
        filters.resource ||
        filters.actorUserId ||
        filters.from ||
        filters.to,
    );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    router.push(
      buildUrl(
        pathname,
        searchParams,
        {
          q:
            search.trim() ||
            null,

          action:
            filters.action ||
            null,

          resource:
            filters.resource ||
            null,

          actor:
            filters.actorUserId ||
            null,

          from:
            from || null,

          to:
            to || null,

          page: "1",
        },
      ),
    );
  }

  function clearFilters() {
    router.push(
      pathname,
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
      <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Filter className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Filter activity
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Narrow the history to the activity you need.
            </p>
          </div>
        </div>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            className="self-start sm:self-auto"
            onClick={
              clearFilters
            }
          >
            <RotateCcw className="mr-2 h-4 w-4" />

            Clear filters
          </Button>
        )}
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-6"
      >
        <div className="relative md:col-span-2 xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            name="q"
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target
                  .value,
              )
            }
            placeholder="Search people, action, or resource ID"
            className="h-11 pl-10"
          />
        </div>

        <Select
          value={
            filters.action
          }
          onValueChange={(
            value,
          ) =>
            router.push(
              buildUrl(
                pathname,
                searchParams,
                {
                  action:
                    value ||
                    null,

                  page: "1",
                },
              ),
            )
          }
          options={
            actionOptions
          }
          aria-label="Filter by activity"
        />

        <Select
          value={
            filters.resource
          }
          onValueChange={(
            value,
          ) =>
            router.push(
              buildUrl(
                pathname,
                searchParams,
                {
                  resource:
                    value ||
                    null,

                  page: "1",
                },
              ),
            )
          }
          options={
            resourceOptions
          }
          aria-label="Filter by resource"
        />

        <Select
          value={
            filters.actorUserId
          }
          onValueChange={(
            value,
          ) =>
            router.push(
              buildUrl(
                pathname,
                searchParams,
                {
                  actor:
                    value ||
                    null,

                  page: "1",
                },
              ),
            )
          }
          options={
            actorOptions
          }
          aria-label="Filter by actor"
        />

        <div className="flex gap-2 md:col-span-2 xl:col-span-2">
          <Input
            type="date"
            value={from}
            onChange={(
              event,
            ) =>
              setFrom(
                event.target
                  .value,
              )
            }
            aria-label="Start date"
            className="h-11 min-w-0 flex-1"
          />

          <Input
            type="date"
            value={to}
            onChange={(
              event,
            ) =>
              setTo(
                event.target
                  .value,
              )
            }
            aria-label="End date"
            className="h-11 min-w-0 flex-1"
          />

          <Button
            type="submit"
            className="h-11 shrink-0"
          >
            Search
          </Button>
        </div>
      </form>
    </section>
  );
}