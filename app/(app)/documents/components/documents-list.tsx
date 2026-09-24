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
  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,2fr)_100px_120px_150px_44px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:grid">
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
          />
        ))}
      </div>
    </section>
  );
}
