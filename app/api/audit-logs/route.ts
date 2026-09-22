import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AuthorizationError,
} from "@/lib/auth/authorization";

import {
  AuditLogServiceError,
  getAuditLogDirectoryData,
} from "@/lib/audit/audit-service";

export const dynamic =
  "force-dynamic";

function toPositiveInteger(
  value: string | null,
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

function errorResponse(
  error: unknown,
) {
  if (
    error instanceof
    AuthorizationError
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          error.message,
      },
      {
        status:
          error.statusCode,
      },
    );
  }

  if (
    error instanceof
    AuditLogServiceError
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          error.message,
      },
      {
        status:
          error.status,
      },
    );
  }

  console.error(
    "Audit log API error:",
    error,
  );

  return NextResponse.json(
    {
      success: false,
      message:
        "An unexpected error occurred.",
    },
    {
      status: 500,
    },
  );
}

export async function GET(
  request: NextRequest,
) {
  try {
    const params =
      request.nextUrl
        .searchParams;

    const data =
      await getAuditLogDirectoryData(
        {
          search:
            params.get("q") ??
            "",

          action:
            params.get(
              "action",
            ) ?? "",

          resource:
            params.get(
              "resource",
            ) ?? "",

          actorUserId:
            params.get(
              "actor",
            ) ?? "",

          from:
            params.get(
              "from",
            ) ?? "",

          to:
            params.get(
              "to",
            ) ?? "",

          page:
            toPositiveInteger(
              params.get(
                "page",
              ),
              1,
            ),

          pageSize:
            toPositiveInteger(
              params.get(
                "pageSize",
              ),
              25,
            ),
        },
      );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return errorResponse(
      error,
    );
  }
}