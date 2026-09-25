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
  const [items, setItems] = useState(documents);
  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string | null>(null);

  useEffect(() => {
    setItems(documents);
  }, [documents]);

  useEffect(() => {
    if (!selectedDocumentId) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-document-actions]")) return;
      setSelectedDocumentId(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedDocumentId(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedDocumentId]);

  function removeDocument(documentId: string) {
    setItems((current) =>
      current.filter((document) => document.id !== documentId),
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No documents found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((document) => (
        <DocumentRow
          key={document.id}
          document={document}
          selected={selectedDocumentId === document.id}
          onSelect={() => setSelectedDocumentId(document.id)}
          onClose={() => setSelectedDocumentId(null)}
          onDeleted={removeDocument}
        />
      ))}
    </section>
  );
}
