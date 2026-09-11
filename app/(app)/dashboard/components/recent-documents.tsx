import {
  ArrowRight,
  FileText,
} from "lucide-react";

import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { DashboardSection } from "./dashboard-section";

const recentDocuments = [
  {
    name: "Engineering Architecture Guide",
    type: "PDF",
    updated: "12 minutes ago",
    status: "Processed",
  },
  {
    name: "Employee Handbook",
    type: "PDF",
    updated: "42 minutes ago",
    status: "Processed",
  },
  {
    name: "Security Incident Response",
    type: "DOCX",
    updated: "2 hours ago",
    status: "Processing",
  },
  {
    name: "Expense & Reimbursement Policy",
    type: "PDF",
    updated: "Yesterday",
    status: "Processed",
  },
];

export function RecentDocuments() {
  return (
    <DashboardSection
      title="Recent documents"
      description="Recently uploaded or updated organization documents."
      action={
        <Button variant="ghost" size="sm">
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      }
    >
      <div className="divide-y divide-slate-100">
        {recentDocuments.map((document) => (
          <div
            key={document.name}
            className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <FileText className="h-4 w-4 text-slate-500" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {document.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {document.type} · {document.updated}
                </p>
              </div>
            </div>

            <Badge
              variant={
                document.status === "Processed"
                  ? "success"
                  : "warning"
              }
            >
              {document.status}
            </Badge>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}