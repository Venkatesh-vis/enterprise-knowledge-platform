"use client";

import * as React from "react";

export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
};

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  id,
  "aria-label": ariaLabel,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] =
    React.useState(defaultChecked);

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  function handleChange() {
    if (disabled) {
      return;
    }

    const nextChecked = !isChecked;

    if (!isControlled) {
      setInternalChecked(nextChecked);
    }

    onCheckedChange?.(nextChecked);
  }

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleChange}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 rounded-full p-0.5",
        "outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-slate-950" : "bg-slate-200",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "block h-5 w-5 rounded-full bg-white shadow-sm",
          "transition-transform duration-200",
          isChecked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}