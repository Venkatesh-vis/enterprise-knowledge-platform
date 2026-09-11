import type { LucideIcon } from "lucide-react";
import { FileSearch } from "lucide-react";
import { Button } from "./button";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon = FileSearch,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
        <Icon
          aria-hidden="true"
          className="h-5 w-5 text-slate-500"
        />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-500">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          size="sm"
          className="mt-4"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}