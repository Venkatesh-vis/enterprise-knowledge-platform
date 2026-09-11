import * as React from "react";

import { cn } from "@/app/shared/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required = false, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        {...props}
        className={cn(
          "text-sm font-medium text-slate-700",
          className,
        )}
      >
        {children}

        {required && (
          <span
            aria-hidden="true"
            className="ml-1 text-red-500"
          >
            *
          </span>
        )}
      </label>
    );
  },
);

Label.displayName = "Label";

export { Label };