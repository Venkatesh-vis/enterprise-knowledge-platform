import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-16">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-slate-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-slate-200/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-slate-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* 404 */}
        <p className="text-7xl font-bold tracking-tight text-slate-200 sm:text-8xl">
          404
        </p>

        <div className="mx-auto mt-2 h-px w-12 bg-slate-300" />

        {/* Heading */}
        <h1 className="mt-7 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved to another location.
        </p>

        {/* Action */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
        </div>

        {/* Bottom hint */}
        <p className="mt-10 text-xs text-slate-400">
          Check the URL and try again.
        </p>
      </div>
    </main>
  );
}
