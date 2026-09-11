import {
  Bot,
  Database,
  HardDrive,
} from "lucide-react";

import { DashboardSection } from "./dashboard-section";
import { UsageMetric } from "./usage-metric";

export function UsageOverview() {
  return (
    <DashboardSection
      title="Platform usage"
      description="Current storage, AI consumption, and indexing status."
    >
      <div className="space-y-7 p-5">
        <UsageMetric
          icon={HardDrive}
          label="Document storage"
          value="6.4 GB"
          detail="10 GB limit"
          percentage={64}
        />

        <UsageMetric
          icon={Bot}
          label="AI usage"
          value="₹1,842"
          detail="Current month"
          percentage={42}
        />

        <UsageMetric
          icon={Database}
          label="Knowledge indexing"
          value="92%"
          detail="Almost complete"
          percentage={92}
        />
      </div>
    </DashboardSection>
  );
}