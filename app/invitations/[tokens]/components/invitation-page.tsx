"use client";

import Link from "next/link";
import {AlertCircle,Building2,CheckCircle2,Clock3,Mail,ShieldCheck,UserPlus,} from "lucide-react";
import { InvitationAcceptForm } from "./invitation-accept-form";
import { InvitationStatus } from "./invitation-status";

export type InvitationState =
  | "valid-new-user"
  | "valid-existing-user"
  | "accepted"
  | "expired"
  | "revoked"
  | "invalid"
  | "already-member"
  | "email-mismatch"
  | "error";

interface InvitationPageProps {
  token: string;
}

/**
 * Temporary UI state.
 *
 * This will be replaced by a server-side invitation
 * lookup once the database/authentication layer is connected.
 */
const invitation = {
  state: "valid-new-user" as InvitationState,
  organizationName: "Acme Technologies",
  invitedEmail: "alice@acme.com",
  roleName: "Member",
  expiresAt: "August 31, 2026",
};

export function InvitationPage({
  token,
}: InvitationPageProps) {
  const state = invitation.state;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faff] px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            aria-label="Enterprise Knowledge Platform home"
            className="group flex cursor-pointer items-center gap-2.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <ShieldCheck
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <span className="text-sm font-semibold tracking-tight text-slate-950">
              Enterprise Knowledge
            </span>
          </Link>
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          {state === "valid-new-user" && (
            <ValidInvitation
              token={token}
              existingUser={false}
            />
          )}

          {state === "valid-existing-user" && (
            <ValidInvitation
              token={token}
              existingUser
            />
          )}

          {state === "accepted" && (
            <InvitationStatus
              icon={CheckCircle2}
              iconClassName="bg-emerald-50 text-emerald-600"
              title="Invitation already accepted"
              description="This invitation has already been used. If you already joined the organization, sign in to continue."
            >
              <Link
                href="/login"
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              >
                Sign in
              </Link>
            </InvitationStatus>
          )}

          {state === "expired" && (
            <InvitationStatus
              icon={Clock3}
              iconClassName="bg-amber-50 text-amber-600"
              title="Invitation expired"
              description="This invitation is no longer valid. Ask the organization administrator to send you a new invitation."
            >
              <Link
                href="/"
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Return home
              </Link>
            </InvitationStatus>
          )}

          {state === "revoked" && (
            <InvitationStatus
              icon={AlertCircle}
              iconClassName="bg-red-50 text-red-600"
              title="Invitation revoked"
              description="This invitation has been revoked by an organization administrator. Contact the administrator if you believe this was a mistake."
            >
              <Link
                href="/"
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Return home
              </Link>
            </InvitationStatus>
          )}

          {state === "invalid" && (
            <InvitationStatus
              icon={AlertCircle}
              iconClassName="bg-red-50 text-red-600"
              title="Invalid invitation"
              description="This invitation link is invalid or no longer exists. Check that you used the complete invitation link from your email."
            >
              <Link
                href="/"
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Return home
              </Link>
            </InvitationStatus>
          )}

          {state === "already-member" && (
            <InvitationStatus
              icon={Building2}
              iconClassName="bg-indigo-50 text-indigo-600"
              title="You're already a member"
              description="Your account already belongs to this organization. Sign in to access your workspace."
            >
              <Link
                href="/login"
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Sign in
              </Link>
            </InvitationStatus>
          )}

          {state === "email-mismatch" && (
            <InvitationStatus
              icon={Mail}
              iconClassName="bg-amber-50 text-amber-600"
              title="Use the invited account"
              description="This invitation was sent to a different email address. Sign in with the invited account to accept it."
            >
              <Link
                href="/login"
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Sign in
              </Link>
            </InvitationStatus>
          )}

          {state === "error" && (
            <InvitationStatus
              icon={AlertCircle}
              iconClassName="bg-red-50 text-red-600"
              title="Something went wrong"
              description="We couldn't load this invitation right now. Please try again later."
            >
              <button
                type="button"
                onClick={() =>window.location.reload()}
                className="w-full cursor-pointer rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Try again
              </button>
            </InvitationStatus>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          If you weren&apos;t expecting this invitation,
          you can safely ignore this email.
        </p>
      </div>
    </main>
  );
}

function ValidInvitation({
  token,
  existingUser,
}: {
  token: string;
  existingUser: boolean;
}) {
  return (
    <div className="p-6 sm:p-8">
      {/* Invitation header */}
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
        >
          <UserPlus className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
          You&apos;ve been invited
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          You&apos;ve been invited to join{" "}
          <strong className="font-semibold text-slate-700">
            {invitation.organizationName}
          </strong>
          .
        </p>
      </div>

      {/* Organization details */}
      <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
            <Building2
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {invitation.organizationName}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Enterprise Knowledge Platform
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">
              Invited email
            </p>

            <p className="mt-1 truncate text-sm font-medium text-slate-700">
              {invitation.invitedEmail}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Assigned role
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {invitation.roleName}
            </p>
          </div>
        </div>
      </div>

      {/* Existing account */}
      {existingUser ? (
        <div className="mt-6">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-sm font-medium text-indigo-900">
              You already have an account
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-700/80">
              Sign in with the invited account to accept
              this invitation.
            </p>
          </div>

          <Link
            href={`/login?invitation=${encodeURIComponent(token)}`}
            className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
          >
            Sign in & accept invitation
          </Link>
        </div>
      ) : (
        <InvitationAcceptForm
          token={token}
          invitedEmail={invitation.invitedEmail}
        />
      )}

      {/* Expiry */}
      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Clock3
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />

        Invitation expires {invitation.expiresAt}
      </div>
    </div>
  );
}