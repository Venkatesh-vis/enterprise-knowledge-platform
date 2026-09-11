import * as React from "react";

export type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function Separator({
  orientation = "horizontal",
  className = "",
}: SeparatorProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={[
        isHorizontal
          ? "h-px w-full bg-slate-200"
          : "h-full w-px bg-slate-200",
        className,
      ].join(" ")}
    />
  );
}