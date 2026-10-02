"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

import { useWorkspaceStore } from "@/app/shared/store/workspace-store";

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function AiCreditsMeter() {
  const overview = useWorkspaceStore((state) => state.overview);
  const isLoading = useWorkspaceStore((state) => state.isLoading);

  if (isLoading && !overview) {
    return (
      <div className="shrink-0 border-b border-slate-100 px-4 py-3" aria-hidden="true">
        <div className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-3 w-12 rounded bg-slate-200" />
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-slate-200" />
          <div className="mt-2 h-3 w-28 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const used = Math.max(0, overview.aiCreditsUsed);
  const limit = overview.aiCreditsLimit;
  const unlimited = limit === null;
  const progress =
    unlimited || limit <= 0 ? 0 : Math.min(100, (used / limit) * 100);
  const isNearLimit = !unlimited && progress >= 80;
  const exhausted = !unlimited && (limit <= 0 || used >= limit);

  return (
    <div className="shrink-0 border-b border-slate-100 px-4 py-3">
      <Link
        href="/billing"
        className="group block rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        aria-label="View AI credit usage and billing"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Bot className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">
                AI credits
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Monthly allowance
              </p>
            </div>
          </div>
          <Sparkles
            className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors duration-200 group-hover:text-indigo-400"
            aria-hidden="true"
          />
        </div>

        <div
          className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={unlimited ? undefined : limit}
          aria-valuenow={unlimited ? undefined : Math.min(used, limit)}
          aria-label={
            unlimited
              ? "Unlimited AI credits"
              : used + " of " + limit + " AI credits used"
          }
        >
          {unlimited ? (
            <motion.div
              className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-slate-300 via-slate-500 to-slate-300"
              animate={{ x: ["-130%", "320%"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : (
            <motion.div
              className={
                "h-full rounded-full bg-gradient-to-r " +
                (exhausted || isNearLimit
                  ? "from-amber-400 to-red-500"
                  : "from-slate-700 to-indigo-500")
              }
              initial={{ width: 0 }}
              animate={{ width: progress + "%" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p
            className={
              "truncate text-[10px] font-medium " +
              (exhausted
                ? "text-red-600"
                : isNearLimit
                  ? "text-amber-600"
                  : "text-slate-500")
            }
          >
            {unlimited
              ? "Unlimited"
              : formatCredits(used) + " / " + formatCredits(limit) + " used"}
          </p>
          <p className="shrink-0 text-[10px] text-slate-400">
            {unlimited
              ? "View billing"
              : formatCredits(Math.max(0, limit - used)) + " left"}
          </p>
        </div>
      </Link>
    </div>
  );
}
