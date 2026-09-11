"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({reset,}: {error: Error & { digest?: string }; reset: () => void;}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div
        className="w-full max-w-md text-center"
        role="alert"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-5 text-lg font-semibold text-slate-950">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          We couldn&apos;t load this part of the application.
          Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <RefreshCw
            className="h-4 w-4"
            aria-hidden="true"
          />

          Try again
        </button>
      </div>
    </main>
  );
}