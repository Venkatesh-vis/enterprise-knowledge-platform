"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

type BillingErrorProps = {
  reset: () => void;
};

export function BillingError({ reset }: BillingErrorProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
        role="alert"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-slate-950">
          Billing could not be loaded
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Something went wrong while loading your billing workspace.
          Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  );
}
