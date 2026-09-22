"use client";

import {
  Clock3,
  MailCheck,
  MailPlus,
  MailWarning,
  Upload,
  Users,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { Button } from "@/app/shared/ui/button";

import type { Permission } from "@/app/shared/lib/permissions";

import type {
  CreateInvitationInput,
  InvitationListItem,
  InvitationPageData,
  InvitationRoleKey,
  InvitationStatus,
  ImportInvitationInput,
} from "@/lib/invitations/types";

import {
  addDays,
  createDummyInvitationId,
  getInvitableRoleKeys,
  getRoleLabel,
} from "@/lib/invitations/utils";

import { InvitationActionDialog } from "./invitation-action-dialog";
import { InvitationDetailDialog } from "./invitation-detail-dialog";
import { InvitationFilters } from "./invitation-filters";
import { InvitationFormDialog } from "./invitation-form-dialog";
import { InvitationImportDialog } from "./invitation-import-dialog";
import { InvitationMobileCard } from "./invitation-mobile-card";
import { InvitationTable } from "./invitation-table";

type Props = {
  data: InvitationPageData;

  permissions: Permission[];

  currentUserName: string;

  currentRole: InvitationRoleKey;
};

const PAGE_SIZE = 8;

export function InvitationsPage({
  data,
  permissions,
  currentUserName,
  currentRole,
}: Props) {
  const [
    invitations,
    setInvitations,
  ] = useState<
    InvitationListItem[]
  >(() => data.invitations);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    InvitationStatus | "ALL"
  >("ALL");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState<
    InvitationRoleKey | "ALL"
  >("ALL");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    showInviteDialog,
    setShowInviteDialog,
  ] = useState(false);

  const [
    showImportDialog,
    setShowImportDialog,
  ] = useState(false);

  const [
    selectedInvitation,
    setSelectedInvitation,
  ] =
    useState<InvitationListItem | null>(
      null,
    );

  const [
    detailInvitation,
    setDetailInvitation,
  ] =
    useState<InvitationListItem | null>(
      null,
    );

  const [
    actionInvitation,
    setActionInvitation,
  ] =
    useState<InvitationListItem | null>(
      null,
    );

  const [
    action,
    setAction,
  ] = useState<
    "RESEND" | "REVOKE" | null
  >(null);

  const [
    actionSubmitting,
    setActionSubmitting,
  ] = useState(false);

  const [
    notice,
    setNotice,
  ] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const canCreate =
    permissions.includes(
      "INVITATION_CREATE",
    ) ||
    permissions.includes(
      "USER_INVITE",
    );

  const canImport =
    permissions.includes(
      "INVITATION_IMPORT",
    );

  const canResend =
    permissions.includes(
      "INVITATION_RESEND",
    );

  const canRevoke =
    permissions.includes(
      "INVITATION_REVOKE",
    );

  const invitableRoles =
    getInvitableRoleKeys(
      currentRole,
    );

  const stats = useMemo(
    () => ({
      total:
        invitations.length,

      pending:
        invitations.filter(
          (item) =>
            item.status ===
            "PENDING",
        ).length,

      accepted:
        invitations.filter(
          (item) =>
            item.status ===
            "ACCEPTED",
        ).length,

      expired:
        invitations.filter(
          (item) =>
            item.status ===
            "EXPIRED",
        ).length,

      revoked:
        invitations.filter(
          (item) =>
            item.status ===
            "REVOKED",
        ).length,
    }),
    [invitations],
  );

  const filteredInvitations =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return invitations.filter(
        (invitation) => {
          const matchesSearch =
            !normalizedSearch ||
            invitation.email
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              invitation.name ??
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            statusFilter ===
            "ALL" ||
            invitation.status ===
            statusFilter;

          const matchesRole =
            roleFilter ===
            "ALL" ||
            invitation.roleKey ===
            roleFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesRole
          );
        },
      );
    }, [
      invitations,
      search,
      statusFilter,
      roleFilter,
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredInvitations.length /
        PAGE_SIZE,
      ),
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedInvitations =
    filteredInvitations.slice(
      (safeCurrentPage - 1) *
      PAGE_SIZE,
      safeCurrentPage *
      PAGE_SIZE,
    );

  const existingEmails =
    invitations.map(
      (invitation) =>
        invitation.email,
    );

  function showNotice(
    type: "success" | "error",
    message: string,
  ) {
    setNotice({
      type,
      message,
    });

    window.setTimeout(() => {
      setNotice(null);
    }, 3500);
  }

  function handleCreateInvitation(
    input: CreateInvitationInput,
  ) {
    const emailExists =
      invitations.some(
        (invitation) =>
          invitation.email
            .trim()
            .toLowerCase() ===
          input.email
            .trim()
            .toLowerCase(),
      );

    if (emailExists) {
      throw new Error(
        "This email already has an invitation or membership.",
      );
    }

    if (
      !invitableRoles.includes(
        input.roleKey,
      )
    ) {
      throw new Error(
        "You are not allowed to assign this role.",
      );
    }

    const now =
      new Date();

    const invitation: InvitationListItem =
    {
      id: createDummyInvitationId(),

      email:
        input.email
          .trim()
          .toLowerCase(),

      name:
        input.name.trim() ||
        null,

      roleKey:
        input.roleKey,

      roleName:
        getRoleLabel(
          input.roleKey,
        ),

      status:
        "PENDING",

      createdAt:
        now.toISOString(),

      expiresAt:
        addDays(
          now,
          7,
        ).toISOString(),

      lastSentAt:
        now.toISOString(),

      invitedByName:
        currentUserName,

      sendCount: 1,
    };

    setInvitations(
      (current) => [
        invitation,
        ...current,
      ],
    );

    setCurrentPage(1);

    showNotice(
      "success",
      `Invitation prepared for ${invitation.email}.`,
    );
  }

  function handleImportInvitations(
    inputs: ImportInvitationInput[],
  ) {
    if (
      inputs.length === 0
    ) {
      throw new Error(
        "No valid invitations were provided.",
      );
    }

    const now =
      new Date();

    const existing =
      new Set(
        invitations.map(
          (item) =>
            item.email
              .trim()
              .toLowerCase(),
        ),
      );

    const batch =
      new Set<string>();

    const newInvitations =
      inputs.map(
        (input) => {
          const email =
            input.email
              .trim()
              .toLowerCase();

          if (
            existing.has(
              email,
            ) ||
            batch.has(email)
          ) {
            throw new Error(
              `Duplicate invitation detected for ${email}.`,
            );
          }

          if (
            !invitableRoles.includes(
              input.roleKey,
            )
          ) {
            throw new Error(
              `You cannot assign ${getRoleLabel(
                input.roleKey,
              )}.`,
            );
          }

          batch.add(email);

          return {
            id: createDummyInvitationId(),

            email,

            name:
              input.name
                ?.trim() ||
              null,

            roleKey:
              input.roleKey,

            roleName:
              getRoleLabel(
                input.roleKey,
              ),

            status:
              "PENDING" as const,

            createdAt:
              now.toISOString(),

            expiresAt:
              addDays(
                now,
                7,
              ).toISOString(),

            lastSentAt:
              now.toISOString(),

            invitedByName:
              currentUserName,

            sendCount: 1,
          };
        },
      );

    setInvitations(
      (current) => [
        ...newInvitations,
        ...current,
      ],
    );

    setCurrentPage(1);

    showNotice(
      "success",
      `${newInvitations.length} invitation${newInvitations.length ===
        1
        ? ""
        : "s"
      } prepared successfully.`,
    );
  }

  function openDetails(
    invitation: InvitationListItem,
  ) {
    setDetailInvitation(
      invitation,
    );
  }

  function openAction(
    actionType:
      | "RESEND"
      | "REVOKE",
    invitation: InvitationListItem,
  ) {
    if (
      actionType === "RESEND"
    ) {
      if (
        !canResend ||
        !(
          invitation.status ===
          "PENDING" ||
          invitation.status ===
          "EXPIRED"
        )
      ) {
        showNotice(
          "error",
          "This invitation cannot be resent.",
        );

        return;
      }
    }

    if (
      actionType === "REVOKE"
    ) {
      if (
        !canRevoke ||
        invitation.status !==
        "PENDING"
      ) {
        showNotice(
          "error",
          "Only pending invitations can be revoked.",
        );

        return;
      }
    }

    setAction(
      actionType,
    );

    setActionInvitation(
      invitation,
    );
  }

  function closeAction() {
    if (actionSubmitting) {
      return;
    }

    setAction(null);
    setActionInvitation(
      null,
    );
  }

  function confirmAction() {
    if (
      !action ||
      !actionInvitation
    ) {
      return;
    }

    setActionSubmitting(true);

    try {
      if (
        action === "RESEND"
      ) {
        const now =
          new Date();

        setInvitations(
          (current) =>
            current.map(
              (invitation) =>
                invitation.id ===
                  actionInvitation.id
                  ? {
                    ...invitation,

                    status:
                      "PENDING",

                    lastSentAt:
                      now.toISOString(),

                    expiresAt:
                      addDays(
                        now,
                        7,
                      ).toISOString(),

                    sendCount:
                      invitation.sendCount +
                      1,
                  }
                  : invitation,
            ),
        );

        showNotice(
          "success",
          `Invitation resent to ${actionInvitation.email}.`,
        );
      }

      if (
        action === "REVOKE"
      ) {
        setInvitations(
          (current) =>
            current.map(
              (invitation) =>
                invitation.id ===
                  actionInvitation.id
                  ? {
                    ...invitation,

                    status:
                      "REVOKED",
                  }
                  : invitation,
            ),
        );

        showNotice(
          "success",
          `Invitation for ${actionInvitation.email} has been revoked.`,
        );
      }

      closeAction();
    } catch (caughtError) {
      showNotice(
        "error",
        caughtError instanceof
          Error
          ? caughtError.message
          : "Unable to complete this action.",
      );
    } finally {
      setActionSubmitting(
        false,
      );
    }
  }

  function handleSearchChange(
    value: string,
  ) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleStatusChange(
    value:
      | InvitationStatus
      | "ALL",
  ) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function handleRoleChange(
    value:
      | InvitationRoleKey
      | "ALL",
  ) {
    setRoleFilter(value);
    setCurrentPage(1);
  }

  const hasFilters =
    Boolean(
      search.trim(),
    ) ||
    statusFilter !==
    "ALL" ||
    roleFilter !==
    "ALL";

  const startItem =
    filteredInvitations
      .length === 0
      ? 0
      : (safeCurrentPage -
        1) *
      PAGE_SIZE +
      1;

  const endItem =
    Math.min(
      safeCurrentPage *
      PAGE_SIZE,
      filteredInvitations.length,
    );

  const onClear = () => {
    setSearch("",);
    setStatusFilter("ALL",);
    setRoleFilter("ALL",);
    setCurrentPage(1,);
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${notice.type ===
              "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
          {notice.message}
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {data.organization.name}
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Invitations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Invite people to your
            organization, manage
            pending access, and
            keep track of invitation
            activity.
          </p>
        </div>

        {(canCreate ||
          canImport) && (
            <div className="flex flex-col gap-2 sm:flex-row">
              {canImport && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setShowImportDialog(
                      true,
                    )
                  }
                  className="h-10"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Invite
                </Button>
              )}

              {canCreate && (
                <Button
                  type="button"
                  onClick={() =>
                    setShowInviteDialog(
                      true,
                    )
                  }
                  className="h-10"
                >
                  <MailPlus className="mr-2 h-4 w-4" />
                  Invite member
                </Button>
              )}
            </div>
          )}
      </header>

      <section
        aria-label="Invitation statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total invitations"
          value={stats.total}
          icon={Users}
        />

        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock3}
        />

        <StatCard
          label="Accepted"
          value={
            stats.accepted
          }
          icon={MailCheck}
        />

        <StatCard
          label="Expired"
          value={
            stats.expired
          }
          icon={MailWarning}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
        <InvitationFilters
          search={search}
          status={statusFilter}
          role={roleFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onRoleChange={handleRoleChange}
        />

        {paginatedInvitations.length ===
          0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={onClear}
            onInvite={canCreate ? () => setShowInviteDialog(true,) : undefined}
          />
        ) : (
          <>
            <InvitationTable
              invitations={paginatedInvitations}
              canResend={canResend}
              canRevoke={canRevoke}
              onView={openDetails}
              onResend={(invitation,) => openAction("RESEND", invitation,)}
              onRevoke={(invitation,) => openAction("REVOKE", invitation,)}
            />

            <div className="divide-y divide-slate-100 md:hidden">
              {paginatedInvitations.map(
                (invitation,) => (
                  <InvitationMobileCard
                    key={invitation.id}
                    invitation={invitation}
                    canResend={canResend}
                    canRevoke={canRevoke}
                    onView={openDetails}
                    onResend={(item,) =>openAction("RESEND",item,)}
                    onRevoke={(item,) =>openAction("REVOKE",item,)}
                  />
                ),
              )}
            </div>

            <Pagination
              currentPage={safeCurrentPage}totalPages={totalPages}
              startItem={startItem}
              endItem={endItem}
              totalItems={filteredInvitations.length}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>

      <InvitationFormDialog
        open={
          showInviteDialog
        }
        roles={
          invitableRoles
        }
        existingEmails={
          existingEmails
        }
        onClose={() =>
          setShowInviteDialog(
            false,
          )
        }
        onCreate={
          handleCreateInvitation
        }
      />

      <InvitationImportDialog
        open={
          showImportDialog
        }
        actorRole={
          currentRole
        }
        existingEmails={
          existingEmails
        }
        onClose={() =>
          setShowImportDialog(
            false,
          )
        }
        onImport={
          handleImportInvitations
        }
      />

      <InvitationDetailDialog
        open={
          Boolean(
            detailInvitation,
          )
        }
        invitation={
          detailInvitation
        }
        onClose={() =>
          setDetailInvitation(
            null,
          )
        }
      />

      <InvitationActionDialog
        open={
          Boolean(
            action &&
            actionInvitation,
          )
        }
        action={
          action ??
          "RESEND"
        }
        invitation={
          actionInvitation
        }
        isSubmitting={
          actionSubmitting
        }
        onClose={
          closeAction
        }
        onConfirm={
          confirmAction
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
  onInvite,
}: {
  hasFilters: boolean;

  onClear: () => void;

  onInvite?: () => void;
}) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {hasFilters ? (
          <Users className="h-5 w-5" />
        ) : (
          <MailPlus className="h-5 w-5" />
        )}
      </div>

      <h2 className="mt-4 text-base font-semibold text-slate-950">
        {hasFilters
          ? "No invitations found"
          : "No invitations yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing your search or filters."
          : "Invite people to start building your organization."}
      </p>

      <div className="mt-5 flex justify-center gap-2">
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
          >
            Clear filters
          </Button>
        )}

        {!hasFilters &&
          onInvite && (
            <Button
              type="button"
              onClick={
                onInvite
              }
            >
              <MailPlus className="mr-2 h-4 w-4" />
              Invite member
            </Button>
          )}
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalItems,
  onPageChange,
}: {
  currentPage: number;

  totalPages: number;

  startItem: number;

  endItem: number;

  totalItems: number;

  onPageChange: (
    page: number,
  ) => void;
}) {
  const pageNumbers =
    useMemo(() => {
      const pages =
        new Set<number>();

      pages.add(1);
      pages.add(
        totalPages,
      );
      pages.add(
        Math.max(
          1,
          currentPage - 1,
        ),
      );
      pages.add(
        currentPage,
      );
      pages.add(
        Math.min(
          totalPages,
          currentPage + 1,
        ),
      );

      return Array.from(
        pages,
      )
        .filter(
          (page) =>
            page >= 1 &&
            page <=
            totalPages,
        )
        .sort(
          (a, b) =>
            a - b,
        );
    }, [
      currentPage,
      totalPages,
    ]);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {startItem}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-700">
          {endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">
          {totalItems}
        </span>{" "}
        invitations
      </p>

      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          disabled={
            currentPage <=
            1
          }
          onClick={() =>
            onPageChange(
              currentPage - 1,
            )
          }
          className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Previous
        </button>

        {pageNumbers.map(
          (
            page,
            index,
          ) => {
            const previous =
              pageNumbers[
              index - 1
              ];

            const gap =
              previous !==
              undefined &&
              page -
              previous >
              1;

            return (
              <span
                key={page}
                className="contents"
              >
                {gap && (
                  <span className="px-1 text-xs text-slate-400">
                    …
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onPageChange(
                      page,
                    )
                  }
                  className={`h-8 min-w-8 cursor-pointer rounded-lg px-2 text-xs font-semibold transition ${page ===
                      currentPage
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {page}
                </button>
              </span>
            );
          },
        )}

        <button
          type="button"
          disabled={
            currentPage >=
            totalPages
          }
          onClick={() =>
            onPageChange(
              currentPage + 1,
            )
          }
          className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}