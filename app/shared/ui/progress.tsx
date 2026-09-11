type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({
  value,
  className = "",
}: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={[
        "h-2 overflow-hidden rounded-full bg-slate-100",
        className,
      ].join(" ")}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className="h-full rounded-full bg-slate-900 transition-all duration-300"
        style={{
          width: `${safeValue}%`,
        }}
      />
    </div>
  );
}