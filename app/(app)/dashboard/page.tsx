import { DashboardHeader } from "./components/dashboard-header";
import { QuickActions } from "./components/quick-actions";
import { RecentDocuments } from "./components/recent-documents";
import { StatsGrid } from "./components/stats-grid";
import { UsageOverview } from "./components/usage-overview";


export default function Dashboard() {
  return (
    <div className="space-y-8">
      <DashboardHeader />

      <StatsGrid />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <RecentDocuments />
        <UsageOverview />
      </section>

      <QuickActions />
    </div>
  );
}