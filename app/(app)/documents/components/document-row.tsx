"use client";

import Link from "next/link";
import {
  CalendarDays,
  Download,
  FileText,
  MoreHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { apiRequest } from "@/app/shared/lib/api";
import { Button } from "@/app/shared/ui/button";
import { ConfirmDialog } from "@/app/shared/ui/confirm-dialog";

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

type DeleteResponse = {
  success: boolean;
  message?: string;
  data?: { documentId: string };
};

type DocumentRowProps = {
  document: Document;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
  onDeleted: (documentId: string) => void;
};

const fileStyles = {
  PDF: "bg-red-50 text-red-600 ring-red-100",
  DOCX: "bg-blue-50 text-blue-600 ring-blue-100",
};

export function DocumentRow({
  document,
  selected,
  onSelect,
  onClose,
  onDeleted,
}: DocumentRowProps) {
  return (
    <article
      className={`group relative overflow-visible rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 sm:p-5 ${
        selected
          ? "border-slate-300 shadow-[0_14px_40px_rgba(15,23,42,0.10)] ring-1 ring-slate-200"
          : "border-slate-200/80 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${fileStyles[document.type]}`}
          >
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-950">
              {document.name}
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {document.type} · {document.size}
            </p>
          </div>
        </div>

        <DocumentActions
          document={document}
          open={selected}
          onSelect={onSelect}
          onClose={onClose}
          onDeleted={onDeleted}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
          <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{document.uploadedBy}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{document.updated}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <DocumentStatus status={document.status} />
        <span className="text-[11px] font-medium text-slate-400">
          {document.type === "PDF" ? "Portable document" : "Word document"}
        </span>
      </div>
    </article>
  );
}

function DocumentActions({
  document,
  open,
  onSelect,
  onClose,
  onDeleted,
}: {
  document: Document;
  open: boolean;
  onSelect: () => void;
  onClose: () => void;
  onDeleted: (documentId: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");

    try {
      const result = await apiRequest<DeleteResponse>({
        path: `/api/documents/${encodeURIComponent(document.id)}`,
        method: "DELETE",
      });

      if (!result.success) {
        throw new Error(
          result.message ?? "Unable to delete document.",
        );
      }

      setConfirmOpen(false);
      onClose();
      onDeleted(result.data?.documentId ?? document.id);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete document.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div data-document-actions className="relative z-20 shrink-0">
        <Button
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          aria-label={`Actions for ${document.name}`}
          aria-expanded={open}
          className={`h-9 w-9 rounded-xl p-0 transition-all ${
            open
              ? "bg-slate-100 text-slate-950 shadow-sm"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {open && (
          <div
            className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.15)]"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Link
              href={`/api/documents/${encodeURIComponent(document.id)}/download`}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              onClick={onClose}
            >
              <Download className="h-4 w-4 text-slate-500" />
              Download
            </Link>

            <button
              type="button"
              onClick={() => {
                onClose();
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete document?"
        description={`Delete ${document.name}? This removes the document and its knowledge-base associations.`}
        confirmLabel="Delete document"
        danger
        busy={busy}
        onClose={() => {
          if (!busy) {
            setConfirmOpen(false);
            setError("");
          }
        }}
        onConfirm={remove}
      />

      {error && (
        <div
          role="alert"
          className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-xl"
        >
          {error}
        </div>
      )}
    </>
  );
}
