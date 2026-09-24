"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "../../../shared/ui/empty-state";

import { DocumentRow } from "./document-row";

type Document = {
  id: string;
  name: string;
  type: "PDF" | "DOCX";
  size: string;
  updated: string;
  status: "Processed" | "Processing" | "Failed";
  uploadedBy: string;
};

export function DocumentsList({
  documents,
}: {
  documents: Document[];
}) {
  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!selectedDocumentId) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) return;
      if (target.closest("[data-document-actions]")) return;

      setSelectedDocumentId(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedDocumentId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedDocumentId]);

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <section className="overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="hidden grid-cols-[minmax(0,2fr)_100px_120px_150px_44px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 lg:grid">
        <span>Document</span>
        <span>Type</span>
        <span>Status</span>
        <span>Updated</span>
        <span />
      </div>

      <div className="divide-y divide-slate-100">
        {documents.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            selected={selectedDocumentId === document.id}
            onSelect={() => setSelectedDocumentId(document.id)}
            onClose={() => setSelectedDocumentId(null)}
          />
        ))}
      </div>
    </section>
  );
}
