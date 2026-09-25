"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";

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

let activeClose: (() => void) | null = null;

const MENU_WIDTH = 192;
const GAP = 8;
const VIEWPORT_GAP = 8;

export function ActionMenu({
  label = "Actions",
  items,
}: Props) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  function close() {
    setOpen(false);
    if (activeClose === close) activeClose = null;
  }

  function toggle() {
    if (open) {
      close();
      return;
    }

    activeClose?.();
    activeClose = close;
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuHeight = Math.min(items.length * 44 + 12, 280);
      const openUp = rect.bottom + menuHeight + GAP > window.innerHeight;
      const top = openUp
        ? Math.max(VIEWPORT_GAP, rect.top - menuHeight - GAP)
        : rect.bottom + GAP;
      const left = Math.min(
        Math.max(VIEWPORT_GAP, rect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - VIEWPORT_GAP,
      );

      setPosition({ top, left });
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-action-menu-root]")
      ) return;
      close();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, items.length]);

  useEffect(() => () => {
    if (activeClose === close) activeClose = null;
  }, []);

  const menu = open && typeof document !== "undefined"
    ? createPortal(
        <div
          data-action-menu-root
          role="menu"
          className="fixed z-[100] w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10"
          style={{ top: position.top, left: position.left }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {items.length ? items.map((item) => {
            const Icon = item.icon;
            const className = [
              "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
              item.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50",
              item.disabled ? "cursor-not-allowed opacity-40" : "",
            ].join(" ");
            const content = (
              <>
                {Icon ? <Icon className="h-4 w-4 shrink-0 text-slate-400" /> : null}
                <span className="truncate">{item.label}</span>
              </>
            );

            if (item.href && !item.disabled) {
              return <Link key={item.label} href={item.href} role="menuitem" className={className} onClick={close}>{content}</Link>;
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
                  close();
                  item.onSelect?.();
                }}
              >
                {content}
              </button>
            );
          }) : (
            <span className="block px-3 py-2.5 text-xs text-slate-400">No actions available</span>
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <span data-action-menu-root className="inline-flex" data-action-menu-id={id}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${open ? "bg-slate-100 text-slate-950" : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {menu}
    </span>
  );
}
