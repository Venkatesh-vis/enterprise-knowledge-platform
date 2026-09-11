import {
  Bot,
  FileText,
  FolderOpen,
  Users,
} from "lucide-react";

import { DashboardStat } from "./dashboard-stats";

const stats = [
  {
    label: "Documents",
    value: "248",
    description: "12 added this month",
    icon: FileText,
  },
  {
    label: "Knowledge Bases",
    value: "8",
    description: "3 active this week",
    icon: FolderOpen,
  },
  {
    label: "Team Members",
    value: "24",
    description: "2 pending invitations",
    icon: Users,
  },
  {
    label: "AI Usage",
    value: "₹1,842",
    description: "Current billing period",
    icon: Bot,
  },
];

export function StatsGrid() {
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <DashboardStat
            key={stat.label}
            {...stat}
          />
        ))}
      </div>
    </section>
  );
}