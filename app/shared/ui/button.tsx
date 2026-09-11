import React from "react";
import { cn } from "@/app/shared/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        {...props}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-lg",
          "px-4 text-sm font-medium",
          "outline-none transition",
          "focus-visible:ring-2 focus-visible:ring-indigo-500/30",
          "disabled:pointer-events-none disabled:opacity-60",

          variant === "primary" &&
            "bg-slate-950 text-white hover:bg-indigo-700",

          variant === "secondary" &&
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",

          variant === "ghost" &&
            "bg-transparent text-slate-600 hover:bg-slate-100",

          variant === "danger" &&
            "bg-red-600 text-white hover:bg-red-700",

          className,
        )}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };