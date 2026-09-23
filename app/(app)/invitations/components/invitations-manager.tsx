"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  MailCheck,
  MailPlus,
  MailWarning,
  Upload,
  Users,
} from "lucide-react";

import { Button } from "@/app/shared/ui/button";
import { apiRequest } from "@/app/shared/lib/api";
import { useInvitationStore } from "@/app/shared/store/invitation-store";
import type {
  CreateInvitationInput,
  ImportInvitationInput,
  InvitationAction,
  InvitationListItem,
  InvitationPageData,
} from "@/lib/invitations/types";
import { getInvitableRoleKeys } from "@/lib/invitations/utils";

import { InvitationActionDialog } from "./invitation-action-dialog";
import { InvitationDetailDialog } from "./invitation-detail-dialog";
import { InvitationFormDialog } from "./invitation-form-dialog";
import { InvitationImportDialog } from "./invitation-import-dialog";
import { InvitationTable } from "./invitation-table";

type Props = {
  initialData: InvitationPageData;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type CreateResponse = {
  invitation: InvitationListItem;
  emailSent: boolean;
};

type ActionResponse = {
  invitation: InvitationListItem;
  emailSent?: boolean;
  alreadyRevoked?: boolean;
};

type ImportResponse = {
  created: InvitationListItem[];
  createdCount: number;
  sentCount: number;
  failedEmails: string[];
  skipped: { email: string; reason: string }[];
};

export function InvitationsManager({
  initialData,
}: Props) {
  const data =
    useInvitationStore(
      (state) => state.data,
    ) ?? initialData;
  const hydrate = useInvitationStore(
    (state) => state.hydrate,
  );
  const add = useInvitationStore(
    (state) => state.add,
  );
  const addMany = useInvitationStore(
    (state) => state.addMany,
  );
  const update = useInvitationStore(
    (state) => state.update,
  );

  const [dialog, setDialog] =
    useState<"create" | "import" | null>(
      null,
    );
  const [selected, setSelected] =
    useState<InvitationListItem | null>(
      null,
    );
  const [action, setAction] =
    useState<InvitationAction | null>(
      null,
    );
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] =
    useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    hydrate(initialData);
  }, [hydrate, initialData]);

  const roles = useMemo(
    () =>
      getInvitableRoleKeys(
        data.currentRole,
      ),
    [data.currentRole],
  );

  const invitations = useMemo(() => {
    const value = query
      .trim()
      .toLowerCase();

    if (!value) return data.invitations;

    return data.invitations.filter(
      (item) =>
        item.email
          .toLowerCase()
          .includes(value) ||
        item.name
          ?.toLowerCase()
          .includes(value),
    );
  }, [data.invitations, query]);

  function notify(message: string) {
    setNotice(message);
    setError("");
    window.setTimeout(
      () => setNotice(""),
      3500,
    );
  }

  function fail(error: unknown) {
    const value = error as {
      response?: {
        data?: { message?: string };
      };
    };

    const message =
      value.response?.data?.message ??
      "Something went wrong.";

    setError(message);
    setNotice("");
  }

  async function createInvitation(
    input: CreateInvitationInput,
  ) {
    try {
      const response =
        await apiRequest<
          ApiResponse<CreateResponse>
        >({
          path: "/api/invitations",
          method: "POST",
          body: input,
        });

      add(response.data.invitation);
      notify(response.message);
    } catch (error) {
      fail(error);
      throw error;
    }
  }

  async function importInvitations(
    inputs: ImportInvitationInput[],
  ) {
    try {
      const response =
        await apiRequest<
          ApiResponse<ImportResponse>
        >({
          path: "/api/invitations/import",
          method: "POST",
          body: { invitations: inputs },
        });

      addMany(response.data.created);

      const details = [
        `${response.data.createdCount} invitation(s) imported.`,
        response.data.failedEmails.length
          ? `${response.data.failedEmails.length} email(s) could not be delivered.`
          : "",
        response.data.skipped.length
          ? `${response.data.skipped.length} row(s) skipped.`
          : "",
      ].filter(Boolean).join(" ");

      notify(details);
    } catch (error) {
      fail(error);
      throw error;
    }
  }

  async function confirmAction() {
    if (!selected || !action) return;

    setBusy(true);

    try {
      const endpoint =
        action === "RESEND"
          ? "resend"
          : "revoke";

      const response =
        await apiRequest<
          ApiResponse<ActionResponse>
        >({
          path: `/api/invitations/${selected.id}/${endpoint}`,
          method: "POST",
        });

      update(response.data.invitation);
      notify(response.message);
      setSelected(null);
      setAction(null);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Invitations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage organization invitations.
          </p>
        </div>

        <div className="flex gap-2">
          {data.permissions.canImport && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDialog("import")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Bulk Invite
            </Button>
          )}
          {data.permissions.canCreate && (
            <Button
              type="button"
              onClick={() => setDialog("create")}
            >
              <MailPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Total" value={data.stats.total} />
        <Stat icon={Clock3} label="Pending" value={data.stats.pending} />
        <Stat icon={MailCheck} label="Accepted" value={data.stats.accepted} />
        <Stat
          icon={MailWarning}
          label="Expired / revoked"
          value={data.stats.expired + data.stats.revoked}
        />
      </div>

      {(notice || error) && (
        <div
          role={error ? "alert" : "status"}
          className={`rounded-xl px-4 py-3 text-sm ${
            error
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search invitations..."
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
          />
        </div>

        {invitations.length ? (
          <InvitationTable
            invitations={invitations}
            canResend={data.permissions.canResend}
            canRevoke={data.permissions.canRevoke}
            onView={(item) => setSelected(item)}
            onResend={(item) => {
              setSelected(item);
              setAction("RESEND");
            }}
            onRevoke={(item) => {
              setSelected(item);
              setAction("REVOKE");
            }}
          />
        ) : (
          <div className="p-10 text-center text-sm text-slate-500">
            No invitations found.
          </div>
        )}
      </div>

      <InvitationFormDialog
        open={dialog === "create"}
        roles={roles}
        existingEmails={data.invitations.map(
          (item) => item.email,
        )}
        onClose={() => setDialog(null)}
        onCreate={createInvitation}
      />

      <InvitationImportDialog
        open={dialog === "import"}
        actorRole={data.currentRole}
        existingEmails={data.invitations.map(
          (item) => item.email,
        )}
        onClose={() => setDialog(null)}
        onImport={importInvitations}
      />

      <InvitationActionDialog
        open={!!action}
        action={action ?? "RESEND"}
        invitation={selected}
        isSubmitting={busy}
        onClose={() => {
          if (!busy) {
            setSelected(null);
            setAction(null);
          }
        }}
        onConfirm={confirmAction}
      />

      <InvitationDetailDialog
        open={!!selected && !action}
        invitation={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}
