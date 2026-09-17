import type { UserRoleKey } from "@/lib/users/types";

const ROLE_STYLES: Record<
  UserRoleKey,
  string
> = {
  OWNER:
    "border-violet-200 bg-violet-50 text-violet-700",

  ADMIN:
    "border-blue-200 bg-blue-50 text-blue-700",

  MANAGER:
    "border-amber-200 bg-amber-50 text-amber-700",

  MEMBER:
    "border-slate-200 bg-slate-50 text-slate-600",
};

const ROLE_LABELS: Record<
  UserRoleKey,
  string
> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  MEMBER: "Member",
};

export function RoleBadge({
  role,
}: {
  role: UserRoleKey;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${ROLE_STYLES[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}