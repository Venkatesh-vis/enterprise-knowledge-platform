"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

export type ActionMenuItem = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

type Props = {
  label?: string;
  items: ActionMenuItem[];
};

export function ActionMenu({
  label = "Actions",
  items,
}: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    right: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuHeight = Math.min(
        items.length * 44 + 12,
        280,
      );

      const top =
        rect.bottom + menuHeight + 8 >
        window.innerHeight
          ? Math.max(8, rect.top - menuHeight - 8)
          : rect.bottom + 8;

      setPosition({
        top,
        right: Math.max(
          8,
          window.innerWidth - rect.right,
        ),
      });
    }

    function handlePointerDown(
      event: PointerEvent,
    ) {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest("[data-action-menu]")
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener(
      "scroll",
      updatePosition,
      true,
    );
    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );
    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePosition,
      );
      window.removeEventListener(
        "scroll",
        updatePosition,
        true,
      );
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, items.length]);

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            data-action-menu
            role="menu"
            className="fixed z-[100] w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10"
            style={{
              top: position.top,
              right: position.right,
            }}
            onPointerDown={(event) =>
              event.stopPropagation()
            }
          >
            {items.length ? (
              items.map((item) => {
                const Icon = item.icon;
                const className = [
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50",
                  item.disabled
                    ? "cursor-not-allowed opacity-40"
                    : "",
                ].join(" ");

                const content = (
                  <>
                    {Icon ? (
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : null}
                    <span className="truncate">
                      {item.label}
                    </span>
                  </>
                );

                if (
                  item.href &&
                  !item.disabled
                ) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      role="menuitem"
                      className={className}
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    className={className}
                    onClick={() => {
                      if (item.disabled) return;
                      setOpen(false);
                      item.onSelect?.();
                    }}
                  >
                    {content}
                  </button>
                );
              })
            ) : (
              <span className="block px-3 py-2.5 text-xs text-slate-400">
                No actions available
              </span>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      data-action-menu
      className="relative inline-flex"
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() =>
          setOpen((current) => !current)
        }
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          open
            ? "bg-slate-100 text-slate-950"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        ].join(" ")}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {menu}
    </div>
  );
}
