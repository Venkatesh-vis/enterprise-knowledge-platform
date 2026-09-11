import * as React from "react";

import { cn } from "@/app/shared/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        aria-invalid={error || undefined}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-white px-3 py-2",
          "text-sm text-slate-950",
          "placeholder:text-slate-400",
          "outline-none transition",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus:ring-2",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10",
          className,
        )}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };