import { DocumentsHeader } from "./components/documents-header";
import { DocumentsList } from "./components/documents-list";
import { DocumentsPagination } from "./components/documents-pagination";
import { DocumentsToolbar } from "./components/documents-toolbar";
import { getDocumentPageData } from "@/lib/documents/service";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const data = await getDocumentPageData({
    query: value("q"),
    fileType: value("fileType").toUpperCase() || "ALL",
    status: value("status").toUpperCase() || "ALL",
    knowledgeBaseId: value("knowledgeBaseId"),
    page: Number(value("page")) || 1,
  });

  return <div className="space-y-8">
    <DocumentsHeader totalDocuments={data.pagination.totalItems} canCreate={data.permissions.canCreate} />
    <DocumentsToolbar />
    <section className="space-y-4">
      <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-700">{data.documents.length}</span> of <span className="font-medium text-slate-700">{data.pagination.totalItems}</span> documents</p>
      <DocumentsList documents={data.documents.map((document) => ({
        id: document.id,
        name: document.name,
        type: document.fileType,
        size: `${(document.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
        updated: new Date(document.updatedAt).toLocaleString(),
        status: document.status === "PROCESSED" ? "Processed" : document.status === "PROCESSING" ? "Processing" : "Failed",
        uploadedBy: document.uploadedByName,
      }))} />
      <DocumentsPagination totalPages={data.pagination.totalPages} />
    </section>
  </div>;
}
