import {
  Bot,
  FileUp,
  FolderPlus,
  UserPlus,
} from "lucide-react";

import { DashboardSection } from "./dashboard-section";

const actions = [
  {
    icon: FileUp,
    title: "Upload document",
    description:
      "Add a document to your knowledge workspace.",
  },
  {
    icon: FolderPlus,
    title: "Create knowledge base",
    description:
      "Organize documents by department or topic.",
  },
  {
    icon: UserPlus,
    title: "Invite member",
    description:
      "Add a new member to your organization.",
  },
  {
    icon: Bot,
    title: "Ask AI",
    description:
      "Search your organization's authorized knowledge.",
  },
];

export function QuickActions() {
  return (
    <DashboardSection
      title="Quick actions"
      description="Common tasks for your organization."
    >
      <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              className="group rounded-xl border border-slate-200 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
                <Icon className="h-4 w-4 text-slate-600" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-900">
                {action.title}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
    </DashboardSection>
  );
}