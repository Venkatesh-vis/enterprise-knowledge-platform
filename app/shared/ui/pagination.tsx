"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
};

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "items",
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.min(
    Math.max(1, page),
    Math.max(1, totalPages),
  );

  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const createPageUrl = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const pageStart = Math.max(1, currentPage - 2);
  const pageEnd = Math.min(totalPages, currentPage + 2);
  const pages = Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index,
  );

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-1 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{start}</span>
        –<span className="font-semibold text-slate-700">{end}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <PaginationLink
            href={createPageUrl(currentPage - 1)}
            disabled={currentPage === 1}
            label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationLink>

          {pages.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={createPageUrl(pageNumber)}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors ${
                pageNumber === currentPage
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {pageNumber}
            </Link>
          ))}

          <PaginationLink
            href={createPageUrl(currentPage + 1)}
            disabled={currentPage === totalPages}
            label="Next page"
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
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-label={label}
        aria-disabled="true"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      {children}
    </Link>
  );
}
