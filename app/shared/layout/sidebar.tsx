"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {BarChart3,Bot,CreditCard,FileText,LayoutDashboard,Settings,ShieldCheck,Users,} from "lucide-react";
import {hasPermission,type Permission,type Role,} from "@/app/shared/lib/permissions";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  permission?: Permission;
  disabled?: boolean;
};

const workspaceItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "DASHBOARD_VIEW",
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    permission: "DOCUMENT_READ",
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    permission: "USER_READ",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    permission: "ANALYTICS_READ",
    disabled: true,
  },
  {
    label: "AI Assistant",
    href: "/ai",
    icon: Bot,
    permission: "AI_USE",
    disabled: true,
  },
];

const managementItems: NavigationItem[] = [
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
    permission: "BILLING_READ",
    disabled: true,
  },
  {
    label: "Security",
    href: "/security",
    icon: ShieldCheck,
    permission: "SECURITY_READ",
    disabled: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permission: "ORGANIZATION_SETTINGS_READ",
  },
];

function isActiveRoute(
  pathname: string,
  href: string,
) {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function NavigationLink({
  item,
  pathname,
  layoutId,
}: {
  item: NavigationItem;
  pathname: string;
  layoutId: string;
}) {
  const Icon = item.icon;
  const active = isActiveRoute(
    pathname,
    item.href,
  );

  if (item.disabled) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300">
        <Icon className="h-[18px] w-[18px]" />

        <span>{item.label}</span>

        <span className="ml-auto rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={
        active ? "page" : undefined
      }
      className="group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
    >
      {active && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 rounded-xl bg-slate-100"
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
          }}
        />
      )}

      <Icon
        className={`relative z-10 h-[18px] w-[18px] transition-colors ${
          active
            ? "text-slate-950"
            : "text-slate-400 group-hover:text-slate-700"
        }`}
      />

      <span
        className={`relative z-10 ${
          active
            ? "text-slate-950"
            : ""
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}

function filterNavigationItems(
  items: NavigationItem[],
  role: Role,
) {
  return items.filter(
    (item) =>
      !item.permission ||
      hasPermission(
        role,
        item.permission,
      ),
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  /*
   * Temporary source until the authenticated user/JWT
   * is connected to the UI.
   *
   * Later this value should come from the authenticated
   * user's auth context / JWT-derived user state.
   */
  const role: Role = "OWNER";

  const visibleWorkspaceItems =
    filterNavigationItems(
      workspaceItems,
      role,
    );

  const visibleManagementItems =
    filterNavigationItems(
      managementItems,
      role,
    );

  const usagePercentage = 50;

  return (
    <aside className="hidden h-full w-64 shrink-0 overflow-y-auto scrollbar-hidden border-r border-slate-200 bg-white lg:block">
      <div className="min-h-full">
        {/* Organization */}
        <div className="border-b border-slate-100 p-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold shadow-sm ring-1 ring-slate-200">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Acme Corporation
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Organization workspace
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Primary navigation"
          className="p-3"
        >
          {visibleWorkspaceItems.length >
            0 && (
            <>
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Workspace
              </p>

              <div className="space-y-1">
                {visibleWorkspaceItems.map(
                  (item) => (
                    <NavigationLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      layoutId="active-workspace-item"
                    />
                  ),
                )}
              </div>
            </>
          )}

          {visibleManagementItems.length >
            0 && (
            <>
              <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Management
              </p>

              <div className="space-y-1">
                {visibleManagementItems.map(
                  (item) => (
                    <NavigationLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      layoutId="active-management-item"
                    />
                  ),
                )}
              </div>
            </>
          )}
        </nav>

        {/* Plan */}
        <div className="border-t border-slate-100 p-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Business Plan
                </p>
              </div>

              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-600">
                {usagePercentage}%
              </span>
            </div>

            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="AI usage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                usagePercentage
              }
            >
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${usagePercentage}%`,
                }}
                transition={{
                  duration: 1.2,
                  delay: 0.2,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-700"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}