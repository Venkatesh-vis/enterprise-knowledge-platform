import Link from "next/link";
import { ArrowUpRight, FileUp, Files } from "lucide-react";
import { Badge } from "../../../shared/ui/badge";

export function DocumentsHeader({
  totalDocuments,
  canCreate,
}: {
  totalDocuments: number;
  canCreate: boolean;
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 px-5 py-6 shadow-sm sm:px-7 sm:py-7">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-slate-100/80 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
            <Files className="h-3.5 w-3.5" />
            Knowledge workspace
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Documents
            </h1>
            <Badge>{totalDocuments.toLocaleString("en-IN")}</Badge>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Organize the files that power your organization&apos;s knowledge,
            search, and AI experiences.
          </p>
        </div>

        {canCreate && (
          <Link
            href="/documents/upload"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <FileUp className="h-4 w-4" />
            Upload document
            <ArrowUpRight className="h-4 w-4 text-slate-300" />
          </Link>
        )}
      </div>
    </header>
  );
}
