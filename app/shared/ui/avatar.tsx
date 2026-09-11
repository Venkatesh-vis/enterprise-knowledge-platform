import * as React from "react";

type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({
  src,
  alt = "",
  initials = "?",
  size = "md",
}: AvatarProps) {
  return (
    <div
      className={[
        "overflow-hidden rounded-full bg-slate-900",
        sizeClasses[size],
      ].join(" ")}
    >
      {src ? (
        // We'll replace this with next/image when
        // avatar storage is implemented.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-white">
          {initials}
        </div>
      )}
    </div>
  );
}