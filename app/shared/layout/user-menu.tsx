"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          V
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-4">Venkatesh</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Administrator
          </p>
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="text-sm font-semibold">Venkatesh</p>
            <p className="mt-0.5 text-xs text-slate-500">
              administrator@acme.com
            </p>
          </div>

          <div className="py-1 cursor-pointer">
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Profile
            </button>

            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Account settings
            </button>

            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}