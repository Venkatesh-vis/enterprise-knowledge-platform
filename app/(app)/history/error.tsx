"use client";

import {
  AlertTriangle,
} from "lucide-react";

export default function HistoryError({
  reset,
}: {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-slate-950">
          History could not be loaded
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Something went wrong while loading organization activity. Please try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}