"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "../../../shared/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableScroll } from "../../../shared/ui/table";

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

export function DocumentsList({ documents }: { documents: Document[] }) {
  const [items, setItems] = useState(documents);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  useEffect(() => setItems(documents), [documents]);

  useEffect(() => {
    if (!selectedDocumentId) return;

    function close(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-document-actions]")) return;
      setSelectedDocumentId(null);
    }

    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedDocumentId(null);
    }

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [selectedDocumentId]);

  if (items.length === 0) {
    return <EmptyState title="No documents found" description="Try adjusting your search or filters." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableScroll>
        <Table className="min-w-[900px]">
          <TableHeader>
            <tr>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded by</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {items.map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                selected={selectedDocumentId === document.id}
                onSelect={() => setSelectedDocumentId(document.id)}
                onClose={() => setSelectedDocumentId(null)}
                onDeleted={(id) => setItems((current) => current.filter((item) => item.id !== id))}
              />
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </div>
  );
}
