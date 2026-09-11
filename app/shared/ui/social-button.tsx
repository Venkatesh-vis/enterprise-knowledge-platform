import React from "react";

import { cn } from "@/app/shared/lib/utils";

interface SocialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "google";
}

const SocialButton = React.forwardRef<
  HTMLButtonElement,
  SocialButtonProps
>(({ provider, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        "flex h-10 w-full items-center justify-center gap-3 cursor-pointer rounded-lg",
        "border border-slate-200 bg-white px-4",
        "text-sm font-medium text-slate-700",
        "outline-none transition",
        "hover:bg-slate-50",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/30",
        "disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
    >
      {provider === "google" && (
        <GoogleIcon aria-hidden="true" />
      )}

      <span>
        Continue with Google
      </span>
    </button>
  );
});

SocialButton.displayName = "SocialButton";

function GoogleIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.19Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.86A5.86 5.86 0 0 1 6.23 12c0-.65.11-1.28.31-1.86v-2.5H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.5Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.11c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.19 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.7 5.39l3.24 2.5C7.31 7.83 9.46 6.11 12 6.11Z"
      />
    </svg>
  );
}

export { SocialButton };