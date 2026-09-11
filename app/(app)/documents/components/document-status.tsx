import { CheckCircle2, Loader2 } from "lucide-react";

import { Badge } from "../../../shared/ui/badge";

type DocumentStatusValue =
  | "Processed"
  | "Processing"
  | "Failed";

const statusConfig = {
  Processed: {
    variant: "success" as const,
    icon: CheckCircle2,
  },
  Processing: {
    variant: "warning" as const,
    icon: Loader2,
  },
  Failed: {
    variant: "danger" as const,
    icon: Loader2,
  },
};

export function DocumentStatus({
  status,
}: {
  status: DocumentStatusValue;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon
        aria-hidden="true"
        className={`mr-1.5 h-3.5 w-3.5 ${
          status === "Processing"
            ? "animate-spin"
            : ""
        }`}
      />

      {status}
    </Badge>
  );
}