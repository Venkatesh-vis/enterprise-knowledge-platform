import { DocumentsHeader } from "./components/documents-header";
import { DocumentsList } from "./components/documents-list";
import { DocumentsPagination } from "./components/documents-pagination";
import { DocumentsToolbar } from "./components/documents-toolbar";

const PAGE_SIZE = 20;

const documents = [
  {
    id: "doc_001",
    name: "Engineering Architecture Guide",
    type: "PDF" as const,
    size: "4.8 MB",
    updated: "12 minutes ago",
    status: "Processed" as const,
    uploadedBy: "Venkatesh",
  },
  {
    id: "doc_002",
    name: "Employee Handbook",
    type: "PDF" as const,
    size: "2.1 MB",
    updated: "42 minutes ago",
    status: "Processed" as const,
    uploadedBy: "Priya",
  },
  {
    id: "doc_003",
    name: "Security Incident Response",
    type: "DOCX" as const,
    size: "1.6 MB",
    updated: "2 hours ago",
    status: "Processing" as const,
    uploadedBy: "Rahul",
  },
  {
    id: "doc_004",
    name: "Expense & Reimbursement Policy",
    type: "PDF" as const,
    size: "890 KB",
    updated: "Yesterday",
    status: "Processed" as const,
    uploadedBy: "Anita",
  },
  {
    id: "doc_005",
    name: "API Development Standards",
    type: "PDF" as const,
    size: "3.7 MB",
    updated: "Yesterday",
    status: "Processed" as const,
    uploadedBy: "Venkatesh",
  },
  {
    id: "doc_006",
    name: "Incident Management Procedure",
    type: "DOCX" as const,
    size: "1.2 MB",
    updated: "2 days ago",
    status: "Failed" as const,
    uploadedBy: "Rahul",
  },
  {
    id: "doc_007",
    name: "Remote Work Policy",
    type: "PDF" as const,
    size: "720 KB",
    updated: "3 days ago",
    status: "Processed" as const,
    uploadedBy: "Priya",
  },
  {
    id: "doc_008",
    name: "Database Backup Procedure",
    type: "DOCX" as const,
    size: "1.4 MB",
    updated: "4 days ago",
    status: "Processed" as const,
    uploadedBy: "Anita",
  },
  {
    id: "doc_009",
    name: "Security Access Control Standard",
    type: "PDF" as const,
    size: "2.8 MB",
    updated: "5 days ago",
    status: "Processed" as const,
    uploadedBy: "Venkatesh",
  },
];

type DocumentsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const params = await searchParams;

  const query =
    params.q?.trim().toLowerCase() ?? "";

  const type =
    params.type === "pdf" ||
    params.type === "docx"
      ? params.type
      : "all";

  const status =
    params.status === "processed" ||
    params.status === "processing" ||
    params.status === "failed"
      ? params.status
      : "all";

  const requestedPage = Number(params.page);

  const currentPage =
    Number.isInteger(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  const filteredDocuments =
    documents.filter((document) => {
      const matchesQuery =
        !query ||
        document.name
          .toLowerCase()
          .includes(query);

      const matchesType =
        type === "all" ||
        document.type.toLowerCase() === type;

      const matchesStatus =
        status === "all" ||
        document.status.toLowerCase() === status;

      return (
        matchesQuery &&
        matchesType &&
        matchesStatus
      );
    });

  const totalDocuments =
    filteredDocuments.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalDocuments / PAGE_SIZE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const startIndex =
    (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedDocuments =
    filteredDocuments.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );

  return (
    <div className="space-y-8">
      <DocumentsHeader totalDocuments={totalDocuments}/>

      <DocumentsToolbar />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {paginatedDocuments.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {totalDocuments}
            </span>{" "}
            matching documents
          </p>

          {query && (
            <p className="hidden truncate text-xs text-slate-400 sm:block">
              Search: &quot;{query}&quot;
            </p>
          )}
        </div>

        <DocumentsList documents={paginatedDocuments}/>

        <DocumentsPagination totalPages={totalPages}/>
      </section>
    </div>
  );
}