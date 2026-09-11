import * as React from "react";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean;
  };

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ error = false, className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      {...props}
      className={[
        "min-h-24 w-full resize-y rounded-lg border bg-white",
        "px-3 py-2.5 text-sm text-slate-900 outline-none transition",
        "placeholder:text-slate-400",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
        "focus:ring-2",
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-slate-200 focus:border-slate-400 focus:ring-slate-100",
        className,
      ].join(" ")}
    />
  );
});

Textarea.displayName = "Textarea";