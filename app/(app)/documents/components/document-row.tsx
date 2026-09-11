import {
  FileText,
  MoreHorizontal,
} from "lucide-react";

import { DocumentStatus } from "./document-status";

type Document = {
  id: string;
  name: string;
  type: "PDF" | "DOCX";
  size: string;
  updated: string;
  status: "Processed" | "Processing" | "Failed";
  uploadedBy: string;
};

export function DocumentRow({
  document,
}: {
  document: Document;
}) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,2fr)_100px_120px_150px_44px] lg:items-center lg:gap-4 lg:px-5 lg:py-4">
        <DocumentIdentity document={document} />

        <span className="text-sm text-slate-500">
          {document.type}
        </span>

        <DocumentStatus status={document.status} />

        <span className="text-sm text-slate-500">
          {document.updated}
        </span>

        <DocumentActions document={document} />
      </div>

      {/* Mobile / Tablet */}
      <div className="flex items-start gap-3 px-4 py-4 lg:hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <FileText
            aria-hidden="true"
            className="h-5 w-5 text-slate-500"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-sm font-medium text-slate-900">
              {document.name}
            </p>

            <DocumentActions document={document} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DocumentStatus status={document.status} />

            <span className="text-xs text-slate-400">
              {document.type}
            </span>

            <span className="text-xs text-slate-400">
              {document.size}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {document.updated} · {document.uploadedBy}
          </p>
        </div>
      </div>
    </>
  );
}

function DocumentIdentity({
  document,
}: {
  document: Document;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        <FileText
          aria-hidden="true"
          className="h-5 w-5 text-slate-500"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">
          {document.name}
        </p>

        <p className="mt-1 truncate text-xs text-slate-400">
          {document.size} · {document.uploadedBy}
        </p>
      </div>
    </div>
  );
}

function DocumentActions({
  document,
}: {
  document: Document;
}) {
  return (
    <button
      type="button"
      aria-label={`Actions for ${document.name}`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <MoreHorizontal
        aria-hidden="true"
        className="h-4 w-4"
      />
    </button>
  );
}