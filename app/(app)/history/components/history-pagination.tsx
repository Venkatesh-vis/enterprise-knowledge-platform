import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function buildPageUrl(
  currentSearchParams: string,
  page: number,
) {
  const params =
    new URLSearchParams(
      currentSearchParams,
    );

  params.set(
    "page",
    String(page),
  );

  return `/history?${params.toString()}`;
}

export function HistoryPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  searchParams,
}: {
  page: number;

  totalPages: number;

  totalItems: number;

  pageSize: number;

  searchParams: string;
}) {
  if (
    totalItems === 0
  ) {
    return null;
  }

  const start =
    (page - 1) *
      pageSize +
    1;

  const end =
    Math.min(
      page * pageSize,
      totalItems,
    );

  const pageStart =
    Math.max(
      1,
      page - 2,
    );

  const pageEnd =
    Math.min(
      totalPages,
      page + 2,
    );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {start}
        </span>
        –
        <span className="font-semibold text-slate-700">
          {end}
        </span>{" "}
        of {totalItems}
      </p>

      {totalPages > 1 && (
        <nav
          aria-label="History pagination"
          className="flex items-center gap-1"
        >
          <PaginationLink
            href={buildPageUrl(
              searchParams,
              Math.max(
                1,
                page - 1,
              ),
            )}
            disabled={
              page === 1
            }
            ariaLabel="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationLink>

          {Array.from(
            {
              length:
                pageEnd -
                pageStart +
                1,
            },
            (
              _,
              index,
            ) =>
              pageStart +
              index,
          ).map(
            (
              pageNumber,
            ) => (
              <Link
                key={
                  pageNumber
                }
                href={buildPageUrl(
                  searchParams,
                  pageNumber,
                )}
                aria-current={
                  pageNumber ===
                  page
                    ? "page"
                    : undefined
                }
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                  pageNumber ===
                  page
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {pageNumber}
              </Link>
            ),
          )}

          <PaginationLink
            href={buildPageUrl(
              searchParams,
              Math.min(
                totalPages,
                page + 1,
              ),
            )}
            disabled={
              page ===
              totalPages
            }
            ariaLabel="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </nav>
      )}
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  ariaLabel,
  children,
}: {
  href: string;

  disabled: boolean;

  ariaLabel: string;

  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-label={
          ariaLabel
        }
        aria-disabled="true"
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-slate-300"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={
        ariaLabel
      }
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}