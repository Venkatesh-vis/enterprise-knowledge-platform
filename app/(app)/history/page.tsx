import { redirect } from "next/navigation";

import {
  AuthorizationError,
} from "@/lib/auth/authorization";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  AuditLogServiceError,
  getAuditLogDirectoryData,
} from "@/lib/audit/audit-service";

import { HistoryPage } from "./components/history-page";

export const dynamic =
  "force-dynamic";

function parsePositiveInteger(
  value:
    | string
    | undefined,
  fallback: number,
) {
  const parsed =
    Number(value);

  return Number.isInteger(
    parsed,
  ) &&
    parsed > 0
    ? parsed
    : fallback;
}

export default async function HistoryRoute({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    action?: string;
    resource?: string;
    actor?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const params =
    await searchParams;

  let data: Awaited<
    ReturnType<typeof getAuditLogDirectoryData>
  >;

  try {
    data =
      await getAuditLogDirectoryData(
        {
          search:
            params.q,

          action:
            params.action,

          resource:
            params.resource,

          actorUserId:
            params.actor,

          from:
            params.from,

          to:
            params.to,

          page:
            parsePositiveInteger(
              params.page,
              1,
            ),

          pageSize: 25,
        },
      );

  } catch (error) {
    if (
      error instanceof
        AuthorizationError &&
      error.statusCode === 403
    ) {
      redirect(
        "/dashboard",
      );
    }

    if (
      error instanceof
        AuditLogServiceError &&
      error.status === 400
    ) {
      redirect(
        "/history",
      );
    }

    throw error;
  }

  return (
    <HistoryPage
      data={data}
    />
  );
}