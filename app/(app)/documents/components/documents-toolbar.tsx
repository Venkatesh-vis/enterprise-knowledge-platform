"use client";

import { Search, X } from "lucide-react";
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
    Object.entries(updates).forEach(([key, value]) => value && value !== "all" ? params.set(key, value) : params.delete(key));
    params.delete("page");
    const next = params.toString();
    startTransition(() => router.replace(next ? `${pathname}?${next}` : pathname));
  }

  const hasFilters = Boolean(currentQuery) || currentType !== "all" || currentStatus !== "all" || Boolean(searchParams.get("knowledgeBaseId"));

  return <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(event) => { const value = event.target.value; setQuery(value); updateParams({ q: value.trim() }); }} placeholder="Search documents..." aria-label="Search documents" className="pl-9" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex">
        <Select value={currentType} onValueChange={(value) => updateParams({ fileType: value })} aria-label="Filter by type" options={TYPE_OPTIONS} className="min-w-32" />
        <Select value={currentStatus} onValueChange={(value) => updateParams({ status: value })} aria-label="Filter by status" options={STATUS_OPTIONS} className="min-w-36" />
        {hasFilters && <Button variant="ghost" onClick={() => { setQuery(""); startTransition(() => router.replace(pathname)); }} aria-label="Clear filters" title="Clear filters"><X className="h-4 w-4" /></Button>}
      </div>
    </div>
    {isPending && <span role="status" className="sr-only">Updating document results</span>}
  </div>;
}
