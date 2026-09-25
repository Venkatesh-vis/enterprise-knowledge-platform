import { Pagination } from "@/app/shared/ui/pagination";
import { getDocumentPageData } from "@/lib/documents/service";

import { DocumentsHeader } from "./components/documents-header";
import { DocumentsList } from "./components/documents-list";
import { DocumentsToolbar } from "./components/documents-toolbar";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === "string" ? params[key] : "";

  const data = await getDocumentPageData({
    query: value("q"),
    fileType: value("fileType").toUpperCase() || "ALL",
    status: value("status").toUpperCase() || "ALL",
    knowledgeBaseId: value("knowledgeBaseId"),
    page: Number(value("page")) || 1,
  });

  return (
    <div className="space-y-8">
      <DocumentsHeader
        totalDocuments={data.pagination.totalItems}
        canCreate={data.permissions.canCreate}
      />

      <DocumentsToolbar />

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Your documents
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Browse and manage files available to your workspace.
            </p>
          </div>

          {data.pagination.totalItems > 0 && (
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 sm:inline-flex">
              {data.pagination.totalItems.toLocaleString("en-IN")} files
            </span>
          )}
        </div>

        <DocumentsList
          documents={data.documents.map((document) => ({
            id: document.id,
            name: document.name,
            type: document.fileType,
            size: `${(document.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
            updated: new Date(document.updatedAt).toLocaleString(),
            status:
              document.status === "PROCESSED"
                ? "Processed"
                : document.status === "PROCESSING"
                  ? "Processing"
                  : "Failed",
            uploadedBy: document.uploadedByName,
          }))}
        />

        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          pageSize={data.pagination.pageSize}
          itemLabel="documents"
        />
      </section>
    </div>
  );
}
