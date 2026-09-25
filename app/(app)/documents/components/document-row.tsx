"use client";

import Link from "next/link";
import { Download, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import { apiRequest } from "@/app/shared/lib/api";
import { Button } from "@/app/shared/ui/button";
import { ConfirmDialog } from "@/app/shared/ui/confirm-dialog";
import { TableCell, TableRow } from "../../../shared/ui/table";
import { DocumentStatus } from "./document-status";

type Document = { id: string; name: string; type: "PDF" | "DOCX"; size: string; updated: string; status: "Processed" | "Processing" | "Failed"; uploadedBy: string };
type Props = { document: Document; selected: boolean; onSelect: () => void; onClose: () => void; onDeleted: (id: string) => void };
type DeleteResponse = { success: boolean; message?: string; data?: { documentId: string } };

export function DocumentRow({ document, selected, onSelect, onClose, onDeleted }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest<DeleteResponse>({ path: `/api/documents/${encodeURIComponent(document.id)}`, method: "DELETE" });
      if (!result.success) throw new Error(result.message ?? "Unable to delete document.");
      setConfirmOpen(false);
      onClose();
      onDeleted(result.data?.documentId ?? document.id);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete document.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TableRow className={selected ? "bg-slate-50" : undefined}>
        <TableCell>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">{document.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">{document.size}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="font-medium text-slate-600">{document.type}</TableCell>
        <TableCell className="text-slate-600">{document.uploadedBy}</TableCell>
        <TableCell className="whitespace-nowrap text-slate-500">{document.updated}</TableCell>
        <TableCell><DocumentStatus status={document.status} /></TableCell>
        <TableCell className="text-right">
          <div data-document-actions className="relative inline-flex">
            <Button variant="ghost" onClick={(event) => { event.stopPropagation(); onSelect(); }} aria-label={`Actions for ${document.name}`} aria-expanded={selected} className="h-9 w-9 rounded-lg p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {selected && (
              <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl" onPointerDown={(event) => event.stopPropagation()}>
                <Link href={`/api/documents/${encodeURIComponent(document.id)}/download`} onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />Download</Link>
                <button type="button" onClick={() => { onClose(); setConfirmOpen(true); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete</button>
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
      {error && <TableRow><TableCell colSpan={6}><p role="alert" className="text-xs text-red-600">{error}</p></TableCell></TableRow>}
      <ConfirmDialog open={confirmOpen} title="Delete document?" description={`Delete ${document.name}? This removes the document and its knowledge-base associations.`} confirmLabel="Delete document" danger busy={busy} onClose={() => !busy && setConfirmOpen(false)} onConfirm={remove} />
    </>
  );
}
