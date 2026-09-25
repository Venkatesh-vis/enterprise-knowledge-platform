"use client";

import { Download, FileText, Trash2 } from "lucide-react";
import { useState } from "react";

import { ActionMenu } from "@/app/shared/ui/action-menu";
import { apiRequest } from "@/app/shared/lib/api";
import { ConfirmDialog } from "@/app/shared/ui/confirm-dialog";
import { TableCell, TableRow } from "../../../shared/ui/table";
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

type Props = {
  document: Document;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
  onDeleted: (id: string) => void;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
  data?: { documentId: string };
};

export function DocumentRow({
  document,
  onClose,
  onDeleted,
}: Props) {
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
          result.message ??
            "Unable to delete document.",
        );
      }

      setConfirmOpen(false);
      onClose();
      onDeleted(
        result.data?.documentId ?? document.id,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete document.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">
                {document.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {document.size}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="font-medium text-slate-600">
          {document.type}
        </TableCell>
        <TableCell className="text-slate-600">
          {document.uploadedBy}
        </TableCell>
        <TableCell className="whitespace-nowrap text-slate-500">
          {document.updated}
        </TableCell>
        <TableCell>
          <DocumentStatus status={document.status} />
        </TableCell>
        <TableCell className="text-right">
          <ActionMenu
            label={`Actions for ${document.name}`}
            items={[
              {
                label: "Download",
                icon: Download,
                href: `/api/documents/${encodeURIComponent(document.id)}/download`,
              },
              {
                label: "Delete",
                icon: Trash2,
                danger: true,
                onSelect: () => {
                  setConfirmOpen(true);
                },
              },
            ]}
          />
        </TableCell>
      </TableRow>
      {error ? (
        <TableRow>
          <TableCell colSpan={6}>
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          </TableCell>
        </TableRow>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete document?"
        description={`Delete ${document.name}? This removes the document and its knowledge-base associations.`}
        confirmLabel="Delete document"
        danger
        busy={busy}
        onClose={() => !busy && setConfirmOpen(false)}
        onConfirm={remove}
      />
    </>
  );
}
