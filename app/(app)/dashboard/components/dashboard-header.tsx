import { ArrowUpRight, FileUp } from "lucide-react";

import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Badge variant="success">Business Plan</Badge>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Good afternoon, Venkatesh.
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Here&apos;s what&apos;s happening across your organization&apos;s knowledge
          platform.
        </p>
      </div>

      <Button className="shrink-0">
        <FileUp className="h-4 w-4" />
        Upload document
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </div>
  );
}