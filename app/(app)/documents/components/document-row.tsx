"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  FileText,
  MoreHorizontal,
  Trash2,
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
  message: string;
};

type DocumentRowProps = {
  document: Document;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
};

export function DocumentRow({
  document,
  selected,
  onSelect,
  onClose,
}: DocumentRowProps) {
  return (
    <div
      className={`group flex items-start gap-3 px-4 py-4 transition-colors lg:grid lg:grid-cols-[minmax(0,2fr)_100px_120px_150px_100px] lg:items-center lg:gap-4 lg:px-5 ${selected ? "bg-slate-50" : "hover:bg-slate-50/70"}`}
    >
      <DocumentIdentity document={document} />
      <span className="hidden text-sm text-slate-500 lg:block">
        {document.type}
      </span>
      <DocumentStatus status={document.status} />
      <span className="hidden text-sm text-slate-500 lg:block">
        {document.updated}
      </span>
      <DocumentActions
        document={document}
        open={selected}
        onSelect={onSelect}
        onClose={onClose}
      />
    </div>
  );
}

function DocumentIdentity({
  document,
}: {
  document: Document;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
        <FileText className="h-5 w-5 text-slate-500" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">
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
  open,
  onSelect,
  onClose,
}: {
  document: Document;
  open: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");

    try {
      const result = await apiRequest<DeleteResponse>({
        path: `/api/documents/${document.id}`,
        method: "DELETE",
      });

      if (!result.success) {
        throw new Error(
          result.message || "Unable to delete document.",
        );
      }

      setConfirmOpen(false);
      onClose();
      router.refresh();
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
      <div
        data-document-actions
        className="relative z-10 shrink-0"
      >
        <Button
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          aria-label={`Actions for ${document.name}`}
          aria-expanded={open}
          className={`h-9 w-9 rounded-lg px-0 transition-all ${open ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:bg-white hover:text-slate-700"}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {open && (
          <div
            className="absolute right-0 top-11 z-50 w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Link
              href={`/api/documents/${document.id}/download`}
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
