"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];

  placeholder?: string;
  disabled?: boolean;
  error?: boolean;

  className?: string;
  triggerClassName?: string;

  "aria-label"?: string;
  name?: string;
  id?: string;
};

export function Select({
  value,
  defaultValue = "",
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  error = false,
  className = "",
  triggerClassName = "",
  "aria-label": ariaLabel,
  name,
  id,
}: SelectProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const [internalValue, setInternalValue] =
    React.useState(defaultValue);

  const [open, setOpen] = React.useState(false);

  const [highlightedIndex, setHighlightedIndex] =
    React.useState(() => {
      const index = options.findIndex(
        (option) => option.value === defaultValue,
      );

      return index >= 0 ? index : 0;
    });

  const isControlled = value !== undefined;
  const selectedValue = isControlled
    ? value
    : internalValue;

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  const enabledOptions = options.filter(
    (option) => !option.disabled,
  );

  function selectValue(nextValue: string) {
    if (disabled) return;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
    setOpen(false);
  }

  function openSelect() {
    if (disabled) return;

    const selectedIndex = options.findIndex(
      (option) => option.value === selectedValue,
    );

    setHighlightedIndex(
      selectedIndex >= 0 ? selectedIndex : 0,
    );

    setOpen(true);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) {
    if (disabled) return;

    if (!open) {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        openSelect();
      }

      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();

        setHighlightedIndex((current) => {
          const next =
            current + 1 >= options.length
              ? 0
              : current + 1;

          if (options[next]?.disabled) {
            const nextEnabled = findNextEnabled(
              options,
              next,
              1,
            );

            return nextEnabled;
          }

          return next;
        });

        break;
      }

      case "ArrowUp": {
        event.preventDefault();

        setHighlightedIndex((current) => {
          const next =
            current - 1 < 0
              ? options.length - 1
              : current - 1;

          if (options[next]?.disabled) {
            return findNextEnabled(
              options,
              next,
              -1,
            );
          }

          return next;
        });

        break;
      }

      case "Enter":
      case " ": {
        event.preventDefault();

        const option =
          options[highlightedIndex];

        if (option && !option.disabled) {
          selectValue(option.value);
        }

        break;
      }

      case "Escape": {
        event.preventDefault();
        setOpen(false);
        break;
      }

      case "Home": {
        event.preventDefault();

        setHighlightedIndex(
          findNextEnabled(options, 0, 1),
        );

        break;
      }

      case "End": {
        event.preventDefault();

        setHighlightedIndex(
          findNextEnabled(
            options,
            options.length - 1,
            -1,
          ),
        );

        break;
      }
    }
  }

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(
      event: MouseEvent,
    ) {
      const target = event.target;

      if (
        target instanceof Node &&
        !containerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, [open]);

  React.useEffect(() => {
    if (!open || !listRef.current) return;

    const highlighted =
      listRef.current.querySelector(
        '[data-highlighted="true"]',
      );

    highlighted?.scrollIntoView({
      block: "nearest",
    });
  }, [highlightedIndex, open]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedValue}
        />
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openSelect();
          }
        }}
        onKeyDown={handleKeyDown}
        className={[
          "flex h-10 w-full items-center justify-between gap-3",
          "rounded-lg border bg-white px-3",
          "text-sm outline-none transition-all",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",

          open
            ? error
              ? "border-red-400 ring-2 ring-red-100"
              : "border-slate-400 ring-2 ring-slate-100"
            : error
              ? "border-red-300 hover:border-red-400"
              : "border-slate-200 hover:border-slate-300",

          "focus-visible:ring-2",
          error
            ? "focus-visible:border-red-500 focus-visible:ring-red-100"
            : "focus-visible:border-slate-400 focus-visible:ring-slate-100",

          triggerClassName,
        ].join(" ")}
      >
        <span
          className={
            selectedOption
              ? "truncate text-slate-900"
              : "truncate text-slate-400"
          }
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={[
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.98,
            }}
            transition={{
              duration: 0.12,
            }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-950/10"
          >
            <div
              ref={listRef}
              role="listbox"
              aria-label={ariaLabel}
              className="max-h-60 overflow-y-auto"
            >
              {options.length === 0 ? (
                <div className="px-3 py-2.5 text-sm text-slate-400">
                  No options available
                </div>
              ) : (
                options.map((option, index) => {
                  const selected =
                    option.value === selectedValue;

                  const highlighted =
                    index === highlightedIndex;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-disabled={
                        option.disabled || undefined
                      }
                      data-highlighted={
                        highlighted || undefined
                      }
                      disabled={option.disabled}
                      onMouseEnter={() => {
                        if (!option.disabled) {
                          setHighlightedIndex(index);
                        }
                      }}
                      onClick={() => {
                        if (!option.disabled) {
                          selectValue(option.value);
                        }
                      }}
                      className={[
                        "flex w-full items-center justify-between",
                        "rounded-lg px-3 py-2.5 text-left",
                        "text-sm transition-colors",
                        "outline-none",

                        option.disabled
                          ? "cursor-not-allowed text-slate-300"
                          : "text-slate-700",

                        highlighted &&
                          !option.disabled
                          ? "bg-slate-100 text-slate-950"
                          : "",

                        selected
                          ? "font-medium text-slate-950"
                          : "",
                      ].join(" ")}
                    >
                      <span className="truncate">
                        {option.label}
                      </span>

                      {selected && (
                        <Check
                          aria-hidden="true"
                          className="ml-3 h-4 w-4 shrink-0 text-slate-900"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function findNextEnabled(
  options: SelectOption[],
  startIndex: number,
  direction: 1 | -1,
) {
  let index = startIndex;

  for (
    let attempts = 0;
    attempts < options.length;
    attempts++
  ) {
    const option = options[index];

    if (option && !option.disabled) {
      return index;
    }

    index += direction;

    if (index >= options.length) {
      index = 0;
    }

    if (index < 0) {
      index = options.length - 1;
    }
  }

  return startIndex;
}