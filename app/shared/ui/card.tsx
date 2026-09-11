import * as React from "react";

type BaseProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({
  className = "",
  children,
  ...props
}: BaseProps) {
  return (
    <div
      {...props}
      className={[
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: BaseProps) {
  return (
    <div
      {...props}
      className={[
        "border-b border-slate-100 p-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: BaseProps) {
  return (
    <div
      {...props}
      className={[
        "p-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: BaseProps) {
  return (
    <div
      {...props}
      className={[
        "border-t border-slate-100 p-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={[
        "text-sm font-semibold text-slate-900",
        className,
      ].join(" ")}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={[
        "mt-1 text-sm text-slate-500",
        className,
      ].join(" ")}
    >
      {children}
    </p>
  );
}