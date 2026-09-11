import type { LucideIcon } from "lucide-react";

interface InvitationStatusProps {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function InvitationStatus({
  icon: Icon,
  iconClassName,
  title,
  description,
  children,
}: InvitationStatusProps) {
  return (
    <div className="p-6 text-center sm:p-8">
      <div
        className={[
          "mx-auto flex h-12 w-12 items-center justify-center rounded-xl",
          iconClassName,
        ].join(" ")}
      >
        <Icon
          className="h-6 w-6"
          aria-hidden="true"
        />
      </div>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-7">
        {children}
      </div>
    </div>
  );
}