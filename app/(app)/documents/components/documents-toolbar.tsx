"use client";

import { Search, X } from "lucide-react";
import {usePathname,useRouter,useSearchParams,} from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import {Select,type SelectOption,} from "../../../shared/ui/select";

const DOCUMENT_TYPE_OPTIONS: SelectOption[] = [
  {
    value: "all",
    label: "All types",
  },
  {
    value: "pdf",
    label: "PDF",
  },
  {
    value: "docx",
    label: "DOCX",
  },
];

const DOCUMENT_STATUS_OPTIONS: SelectOption[] = [
  {
    value: "all",
    label: "All status",
  },
  {
    value: "processed",
    label: "Processed",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "failed",
    label: "Failed",
  },
];

export function DocumentsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const currentType = searchParams.get("type") ?? "all";
  const currentStatus = searchParams.get("status") ?? "all";
  const [query, setQuery] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    for (const [key, value] of Object.entries(updates,)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // Changing search/filter resets pagination.
    params.delete("page");

    const queryString = params.toString();

    startTransition(() => {
      router.replace(queryString? `${pathname}?${queryString}`: pathname);
    });
  }

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>,) {
    const value = event.target.value;
    setQuery(value);
    updateParams({q: value.trim(),});
  }

  function handleTypeChange(value: string) {
    updateParams({type: value,});
  }

  function handleStatusChange(value: string) {
    updateParams({status: value,});
  }

  function clearFilters() {
    setQuery("");
    startTransition(() => {
      router.replace(pathname);
    });
  }

  const hasFilters = Boolean(currentQuery) || currentType !== "all" || currentStatus !== "all";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />

          <Input
            value={query}
            onChange={handleSearch}
            placeholder="Search documents..."
            aria-label="Search documents"
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Select
            value={currentType}
            onValueChange={handleTypeChange}
            aria-label="Filter by document type"
            options={DOCUMENT_TYPE_OPTIONS}
            className="min-w-32"
          />

          <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            aria-label="Filter by document status"
            options={DOCUMENT_STATUS_OPTIONS}
            className="min-w-36"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              aria-label="Clear filters"
              title="Clear filters"
            >
              <X
                aria-hidden="true"
                className="h-4 w-4"
              />
            </Button>
          )}
        </div>
      </div>

      {isPending && (
        <span
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          Updating document results
        </span>
      )}
    </div>
  );
}