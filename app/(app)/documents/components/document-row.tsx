"use client";

import Link from "next/link";
import { FileText, MoreHorizontal, Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocumentStatus } from "./document-status";
import { Button } from "../../../shared/ui/button";

type Document = { id: string; name: string; type: "PDF" | "DOCX"; size: string; updated: string; status: "Processed" | "Processing" | "Failed"; uploadedBy: string };

export function DocumentRow({ document }: { document: Document }) {
  return <div className="flex items-start gap-3 px-4 py-4 lg:grid lg:grid-cols-[minmax(0,2fr)_100px_120px_150px_100px] lg:items-center lg:gap-4 lg:px-5">
    <DocumentIdentity document={document} />
    <span className="hidden text-sm text-slate-500 lg:block">{document.type}</span>
    <DocumentStatus status={document.status} />
    <span className="hidden text-sm text-slate-500 lg:block">{document.updated}</span>
    <DocumentActions document={document} />
  </div>;
}

function DocumentIdentity({ document }: { document: Document }) {
  return <div className="flex min-w-0 flex-1 items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"><FileText className="h-5 w-5 text-slate-500" /></div>
    <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{document.name}</p><p className="mt-1 truncate text-xs text-slate-400">{document.size} · {document.uploadedBy}</p></div>
  </div>;
}

function DocumentActions({ document }: { document: Document }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete ${document.name}?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/documents/${document.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to delete document.");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete document.");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return <div className="relative shrink-0">
    <Button variant="ghost" onClick={() => setOpen((value) => !value)} aria-label={`Actions for ${document.name}`}><MoreHorizontal className="h-4 w-4" /></Button>
    {open && <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
      <Link href={`/api/documents/${document.id}/download`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />Download</Link>
      <button type="button" onClick={remove} disabled={busy} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" />{busy ? "Deleting..." : "Delete"}</button>
    </div>}
  </div>;
}
