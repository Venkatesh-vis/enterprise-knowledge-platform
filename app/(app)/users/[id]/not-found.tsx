import Link from "next/link";
import {
  ArrowLeft,
  UserRoundX,
} from "lucide-react";

export default function UserNotFound() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <UserRoundX className="h-5 w-5" />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-slate-950">
          User not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          This user is not a member of
          the current organization or no
          longer exists.
        </p>

        <Link
          href="/users"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
      </div>
    </div>
  );
}