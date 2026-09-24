"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Bot, CreditCard, Database, FileText, History, LayoutDashboard, MailPlus, Settings, ShieldCheck, Users } from "lucide-react";
import { permissionGranted, type Permission } from "@/app/shared/lib/permissions";
import { useAuthStore } from "@/app/shared/store/auth-store";

type NavigationItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; permission?: Permission; disabled?: boolean };

const workspaceItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "DASHBOARD_VIEW" },
  { label: "Documents", href: "/documents", icon: FileText, permission: "DOCUMENT_READ" },
  { label: "Knowledge Bases", href: "/knowledge-bases", icon: Database, permission: "KNOWLEDGE_BASE_READ" },
  { label: "Users", href: "/users", icon: Users, permission: "USER_READ" },
  { label: "Invitations", href: "/invitations", icon: MailPlus, permission: "INVITATION_READ" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, permission: "ANALYTICS_READ", disabled: true },
  { label: "AI Assistant", href: "/ai", icon: Bot, permission: "AI_USE", disabled: true },
];

const managementItems: NavigationItem[] = [
  { label: "Billing", href: "/billing", icon: CreditCard, permission: "BILLING_READ", disabled: true },
  { label: "Security", href: "/security", icon: ShieldCheck, permission: "SECURITY_READ", disabled: true },
  { label: "History", href: "/history", icon: History, permission: "AUDIT_LOG_READ" },
  { label: "Settings", href: "/settings", icon: Settings, permission: "ORGANIZATION_SETTINGS_READ" },
];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLink({ item, pathname, layoutId }: { item: NavigationItem; pathname: string; layoutId: string }) {
  const Icon = item.icon;
  const active = isActiveRoute(pathname, item.href);
  if (item.disabled) return <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300"><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span><span className="ml-auto rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">Soon</span></div>;
  return <Link href={item.href} aria-current={active ? "page" : undefined} className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
    {active && <motion.div layoutId={layoutId} className="absolute inset-0 rounded-xl bg-slate-100" />}
    <Icon className={`relative z-10 h-[18px] w-[18px] ${active ? "text-slate-950" : "text-slate-400 group-hover:text-slate-700"}`} />
    <span className={`relative z-10 ${active ? "text-slate-950" : ""}`}>{item.label}</span>
  </Link>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const organization = useAuthStore((state) => state.organization);
  const permissions = useAuthStore((state) => state.permissions);
  const visibleWorkspaceItems = workspaceItems.filter((item) => !item.permission || permissionGranted(permissions, item.permission));
  const visibleManagementItems = managementItems.filter((item) => !item.permission || permissionGranted(permissions, item.permission));
  const organizationName = organization?.name ?? "Workspace";

  return <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
    <div className="shrink-0 border-b border-slate-100 p-4"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="truncate text-sm font-semibold text-slate-950">{organizationName}</p><p className="mt-0.5 text-xs text-slate-500">Organization workspace</p></div></div>
    <nav aria-label="Primary navigation" className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden p-3">
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</p>
      <div className="space-y-1">{visibleWorkspaceItems.map((item) => <NavigationLink key={item.href} item={item} pathname={pathname} layoutId="active-workspace-item" />)}</div>
      <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Management</p>
      <div className="space-y-1">{visibleManagementItems.map((item) => <NavigationLink key={item.href} item={item} pathname={pathname} layoutId="active-management-item" />)}</div>
    </nav>
  </aside>;
}
