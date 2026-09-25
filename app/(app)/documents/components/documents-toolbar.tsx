"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Select, type SelectOption } from "../../../shared/ui/select";

const TYPE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All types" },
  { value: "PDF", label: "PDF" },
  { value: "DOCX", label: "DOCX" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All status" },
  { value: "PROCESSED", label: "Processed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "FAILED", label: "Failed" },
];

export function DocumentsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const currentType = searchParams.get("fileType") ?? "all";
  const currentStatus = searchParams.get("status") ?? "all";
  const [query, setQuery] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    });

    params.delete("page");
    const next = params.toString();
    startTransition(() => router.replace(next ? `${pathname}?${next}` : pathname));
  }

  const hasFilters =
    Boolean(currentQuery) ||
    currentType !== "all" ||
    currentStatus !== "all" ||
    Boolean(searchParams.get("knowledgeBaseId"));

  function clearFilters() {
    setQuery("");
    startTransition(() => router.replace(pathname));
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              updateParams({ q: value.trim() });
            }}
            placeholder="Search by document name..."
            aria-label="Search documents"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/60 pl-10 focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="hidden items-center gap-2 px-1 text-xs font-semibold text-slate-400 sm:flex">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </div>
          <Select value={currentType} onValueChange={(value) => updateParams({ fileType: value })} aria-label="Filter by type" options={TYPE_OPTIONS} className="min-w-36" />
          <Select value={currentStatus} onValueChange={(value) => updateParams({ status: value })} aria-label="Filter by status" options={STATUS_OPTIONS} className="min-w-40" />
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} aria-label="Clear filters" title="Clear filters" className="h-10 rounded-xl px-3 text-slate-500 hover:text-slate-900">
              <X className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {isPending && (
        <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-slate-400" />
        </div>
      )}
    </section>
  );
}
