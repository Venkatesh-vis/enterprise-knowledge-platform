import Link from "next/link";
import { ArrowUpRight, FileUp } from "lucide-react";

import { Badge } from "../../../shared/ui/badge";

export function DocumentsHeader({
  totalDocuments,
}: {
  totalDocuments: number;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Documents
          </h1>

          <Badge variant="default">
            {totalDocuments}
          </Badge>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage the documents that power your organization&apos;s
          knowledge and AI assistant.
        </p>
      </div>

      <Link
        href="/documents/upload"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        <FileUp className="h-4 w-4" />
        Upload document
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}