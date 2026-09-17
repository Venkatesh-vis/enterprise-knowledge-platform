"use client";

export default function UsersError({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-sm font-bold text-red-600">
          !
        </div>

        <h1 className="mt-4 text-lg font-semibold text-slate-950">
          Users could not be loaded
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Something went wrong while loading
          the organization users. Try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}