"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { useActionMenuStore } from "@/app/shared/store/action-menu-store";

export type ActionMenuItem = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export function ActionMenu({
  label = "Actions",
  items,
}: {
  label?: string;
  items: ActionMenuItem[];
}) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openId = useActionMenuStore((state) => state.openId);
  const setOpenId = useActionMenuStore((state) => state.setOpenId);
  const open = openId === id;
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;

    const update = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = 192;
      const height = Math.min(items.length * 44 + 12, 280);
      const top = rect.bottom + height + 8 > window.innerHeight
        ? Math.max(8, rect.top - height - 8)
        : rect.bottom + 8;
      const left = Math.min(
        Math.max(8, rect.right - width),
        window.innerWidth - width - 8,
      );
      setPosition({ top, left });
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-action-menu-root]")) return;
      setOpenId(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, items.length, setOpenId]);

  const menu = open && typeof document !== "undefined"
    ? createPortal(
        <div
          data-action-menu-root
          role="menu"
          className="fixed z-[100] w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10"
          style={{ top: position.top, left: position.left }}
        >
          {items.map((item) => {
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
              return (
                <Link key={item.label} href={item.href} role="menuitem" className={className} onClick={() => setOpenId(null)}>
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
                  setOpenId(null);
                  item.onSelect?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <span data-action-menu-root className="inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpenId(open ? null : id)}
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          open ? "bg-slate-100 text-slate-950" : "text-slate-400 hover:bg-slate-100 hover:text-slate-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        ].join(" ")}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {menu}
    </span>
  );
}
