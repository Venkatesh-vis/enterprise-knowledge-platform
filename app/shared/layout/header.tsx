import Link from "next/link";
import { Bell, Search, } from "lucide-react";
import UserMenu from "./user-menu";
import Image from "next/image";
import icon from "@/app/icon.svg";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="group flex items-center gap-3 rounded-lg outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-slate-950 shadow-sm">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%]"
            />

            <Image
              src={icon}
              alt="Enterprise Knowledge"
              width={36}
              height={36}
              className="relative z-10 h-9 w-9 object-contain"
              priority
            />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-tight">
              Enterprise Knowledge
            </p>

            <p className="text-[11px] text-slate-500">
              Knowledge & AI Platform
            </p>
          </div>
        </Link>



        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Bell className="h-[18px] w-[18px]" />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-slate-950" />
          </button>

          <div className="mx-2 hidden h-7 w-px bg-slate-200 sm:block" />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}