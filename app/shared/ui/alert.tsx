import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";

type AlertVariant =
  | "info"
  | "success"
  | "warning"
  | "error";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
};

const alertConfig: Record<
  AlertVariant,
  {
    icon: typeof Info;
    classes: string;
  }
> = {
  info: {
    icon: Info,
    classes: "border-blue-200 bg-blue-50 text-blue-800",
  },
  success: {
    icon: CheckCircle2,
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  warning: {
    icon: TriangleAlert,
    classes:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  error: {
    icon: AlertCircle,
    classes: "border-red-200 bg-red-50 text-red-800",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
}: AlertProps) {
  const { icon: Icon, classes } = alertConfig[variant];

  return (
    <div
      role="alert"
      className={[
        "flex gap-3 rounded-xl border p-4",
        classes,
      ].join(" ")}
    >
      <Icon
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0"
      />

      <div className="min-w-0">
        {title && (
          <p className="text-sm font-semibold">
            {title}
          </p>
        )}

        <div className="mt-1 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}