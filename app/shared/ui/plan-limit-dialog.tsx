"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, TriangleAlert, X } from "lucide-react";
import { Button } from "./button";

type LimitDialogDetail = { code: "PLAN_LIMIT_REACHED" | "FEATURE_NOT_AVAILABLE"; message: string; resource?: string; used?: number; limit?: number; requested?: number; planName?: string; feature?: string; billingPath?: string };

export function PlanLimitDialog() {
  const router = useRouter();
  const [detail, setDetail] = useState<LimitDialogDetail | null>(null);
  useEffect(() => {
    const handle = (event: Event) => setDetail((event as CustomEvent<LimitDialogDetail>).detail);
    window.addEventListener("billing:limit-reached", handle);
    return () => window.removeEventListener("billing:limit-reached", handle);
  }, []);
  useEffect(() => {
    if (!detail) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDetail(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleKeyDown); };
  }, [detail]);
  if (!detail) return null;
  const isLimit = detail.code === "PLAN_LIMIT_REACHED";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="plan-limit-dialog-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between px-5 pt-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><TriangleAlert className="h-5 w-5" /></div>
          <button type="button" onClick={() => setDetail(null)} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <h2 id="plan-limit-dialog-title" className="text-base font-semibold text-slate-950">{isLimit ? "Plan limit reached" : "Upgrade required"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail.message}</p>
          {isLimit && detail.limit !== undefined && detail.used !== undefined && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Used</p><p className="mt-1 text-sm font-semibold text-slate-900">{detail.used}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Limit</p><p className="mt-1 text-sm font-semibold text-slate-900">{detail.limit}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Plan</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{detail.planName ?? "Current"}</p></div>
            </div>
          )}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
            <Button onClick={() => { setDetail(null); window.location.href = detail.billingPath ?? "/billing"; }}>Go to Billing<ArrowUpRight className="ml-1.5 h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}