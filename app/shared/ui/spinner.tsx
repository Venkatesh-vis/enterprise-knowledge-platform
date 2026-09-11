import { Loader2 } from "lucide-react";

type SpinnerSize = "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

export function Spinner({
  size = "md",
}: {
  size?: SpinnerSize;
}) {
  return (
    <Loader2
      aria-label="Loading"
      className={[
        "animate-spin text-slate-500",
        sizeClasses[size],
      ].join(" ")}
    />
  );
}