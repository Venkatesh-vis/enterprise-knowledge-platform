import {
  CheckCircle2,
  Clock3,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type {
  InvitationStatus,
} from "@/lib/invitations/types";

import {
  STATUS_LABELS,
} from "@/lib/invitations/utils";

const STATUS_STYLES: Record<
  InvitationStatus,
  {
    className: string;
    icon: typeof Clock3;
  }
> = {
  PENDING: {
    className:
      "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock3,
  },

  ACCEPTED: {
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  },

  EXPIRED: {
    className:
      "bg-slate-100 text-slate-600 ring-slate-200",
    icon: RotateCcw,
  },

  REVOKED: {
    className:
      "bg-red-50 text-red-600 ring-red-200",
    icon: XCircle,
  },
};

export function InvitationStatusBadge({
  status,
}: {
  status: InvitationStatus;
}) {
  const config =
    STATUS_STYLES[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {STATUS_LABELS[status]}
    </span>
  );
}