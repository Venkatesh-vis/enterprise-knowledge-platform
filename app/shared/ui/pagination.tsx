"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

export type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange?: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "items",
  onPageChange,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages));

  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pageStart = Math.max(1, currentPage - 2);
  const pageEnd = Math.min(totalPages, currentPage + 2);
  const pages = Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index,
  );

  const createPageUrl = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;
    onPageChange?.(nextPage);
  };

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
          <PageControl
            href={onPageChange ? undefined : createPageUrl(currentPage - 1)}
            disabled={currentPage === 1}
            label="Previous page"
            onClick={() => changePage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </PageControl>

          {pages.map((pageNumber) => (
            <PageControl
              key={pageNumber}
              href={onPageChange ? undefined : createPageUrl(pageNumber)}
              active={pageNumber === currentPage}
              label={`Page ${pageNumber}`}
              onClick={() => changePage(pageNumber)}
            >
              {pageNumber}
            </PageControl>
          ))}

          <PageControl
            href={onPageChange ? undefined : createPageUrl(currentPage + 1)}
            disabled={currentPage === totalPages}
            label="Next page"
            onClick={() => changePage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </PageControl>
        </nav>
      )}
    </div>
  );
}

function PageControl({
  href,
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}: {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const className = `inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
    active
      ? "bg-slate-950 text-white shadow-sm"
      : disabled
        ? "text-slate-300"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  }`;

  if (disabled) {
    return <span aria-label={label} aria-disabled="true" className={className}>{children}</span>;
  }

  if (href) {
    return <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className={className}>{children}</Link>;
  }

  return <button type="button" aria-label={label} aria-current={active ? "page" : undefined} className={className} onClick={onClick}>{children}</button>;
}
