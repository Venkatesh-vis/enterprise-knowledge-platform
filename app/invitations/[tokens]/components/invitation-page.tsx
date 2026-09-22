"use client";

import Link from "next/link";
import { AlertCircle, Building2, CheckCircle2, Clock3, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "@/app/shared/lib/api";
import type { PublicInvitationData } from "@/lib/invitations/types";
import { InvitationAcceptForm } from "./invitation-accept-form";

export function InvitationPage({ token, data }: { token: string; data: PublicInvitationData }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const valid = data.state === "valid-new-user" || data.state === "valid-existing-user";

  async function acceptExisting() {
    setLoading(true);
    setError("");
    try {
      await apiRequest({ path: "/api/invitations/accept", method: "POST", body: { mode: "existing", token } });
      router.replace("/");
    } catch (caught: any) {
      setError(caught?.response?.data?.message ?? "Unable to accept the invitation.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faff] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center"><Link href="/" className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 text-white"><ShieldCheck className="h-5 w-5" /></span><span className="text-sm font-semibold text-slate-950">Enterprise Knowledge</span></Link></div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          {valid ? <div className="p-6 sm:p-8">
            <div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><UserPlus className="h-6 w-6" /></div><h1 className="mt-5 text-2xl font-semibold text-slate-950">You've been invited</h1><p className="mt-2 text-sm text-slate-500">Join <strong className="text-slate-700">{data.organizationName}</strong>.</p></div>
            <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600"><Building2 className="h-5 w-5" /></div><div><p className="text-sm font-semibold text-slate-900">{data.organizationName}</p><p className="text-xs text-slate-500">Enterprise Knowledge Platform</p></div></div><div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"><div><p className="text-xs text-slate-400">Invited email</p><p className="mt-1 truncate text-sm font-medium text-slate-700">{data.invitedEmail}</p></div><div><p className="text-xs text-slate-400">Assigned role</p><p className="mt-1 text-sm font-medium text-slate-700">{data.roleName}</p></div></div></div>
            {data.state === "valid-new-user" ? <InvitationAcceptForm token={token} invitedEmail={data.invitedEmail ?? ""} /> : <div className="mt-6"><p className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">This email already has an account. Sign in with that account to accept the invitation.</p>{error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}{data.authenticated ? <button type="button" onClick={acceptExisting} disabled={loading} className="mt-4 w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{loading ? "Joining..." : "Accept invitation"}</button> : <Link href={`/login?invitation=${encodeURIComponent(token)}`} className="mt-4 flex w-full justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Sign in & accept</Link>}</div>}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />Expires {data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "soon"}</div>
          </div> : <Status state={data.state} />}
        </div>
      </div>
    </main>
  );
}

type StatusConfig = { icon: typeof AlertCircle; title: string; description: string; className: string };

const STATUS: Partial<Record<PublicInvitationData["state"], StatusConfig>> = {
  accepted: { icon: CheckCircle2, title: "Invitation already accepted", description: "This invitation has already been used.", className: "bg-emerald-50 text-emerald-600" },
  expired: { icon: Clock3, title: "Invitation expired", description: "Ask an organization administrator to send a new invitation.", className: "bg-amber-50 text-amber-600" },
  revoked: { icon: AlertCircle, title: "Invitation revoked", description: "This invitation is no longer usable.", className: "bg-red-50 text-red-600" },
  invalid: { icon: AlertCircle, title: "Invalid invitation", description: "This invitation link is invalid or no longer exists.", className: "bg-red-50 text-red-600" },
};

function Status({ state }: { state: PublicInvitationData["state"] }) {
  const config = STATUS[state] ?? STATUS.invalid!;
  const Icon = config.icon;
  return <div className="p-8 text-center"><div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${config.className}`}><Icon className="h-6 w-6" /></div><h1 className="mt-5 text-xl font-semibold text-slate-950">{config.title}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{config.description}</p><Link href="/" className="mt-6 inline-flex rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Return home</Link></div>;
}
