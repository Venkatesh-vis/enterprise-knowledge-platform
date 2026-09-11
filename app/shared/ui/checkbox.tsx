"use client";

import * as React from "react";
import { Check } from "lucide-react";

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
};

export function Checkbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  id,
  "aria-label": ariaLabel,
}: CheckboxProps) {
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
      role="checkbox"
      aria-checked={isChecked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleChange}
      className={[
        "flex h-4 w-4 shrink-0 items-center justify-center rounded",
        "border outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isChecked
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-300 bg-white",
      ].join(" ")}
    >
      {isChecked && (
        <Check
          aria-hidden="true"
          className="h-3 w-3"
        />
      )}
    </button>
  );
}