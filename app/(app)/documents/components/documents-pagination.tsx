"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

type DocumentsPaginationProps = {
  totalPages: number;
};

export function DocumentsPagination({
  totalPages,
}: DocumentsPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(
    1,
    Number(searchParams.get("page")) || 1,
  );

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const queryString = params.toString();

    return queryString
      ? `${pathname}?${queryString}`
      : pathname;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-slate-500">
        Page{" "}
        <span className="font-medium text-slate-700">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-700">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <PaginationLink
          href={createPageUrl(currentPage - 1)}
          disabled={currentPage <= 1}
          label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationLink>

        <PaginationLink
          href={createPageUrl(currentPage + 1)}
          disabled={currentPage >= totalPages}
          label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationLink>
      </div>
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
        aria-disabled="true"
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      {children}
    </Link>
  );
}