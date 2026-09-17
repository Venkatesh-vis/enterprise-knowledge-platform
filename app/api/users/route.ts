import { NextRequest, NextResponse } from "next/server";

import {
  AuthorizationError,
} from "@/lib/auth/authorization";

import {
  getUsersDirectoryData,
  UserServiceError,
} from "@/lib/users/user-service";

function errorResponse(
  error: unknown,
) {
  if (
    error instanceof AuthorizationError
  ) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.status,
      },
    );
  }

  if (
    error instanceof UserServiceError
  ) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.status,
      },
    );
  }

  console.error(
    "Users API error:",
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
    const searchParams =
      request.nextUrl.searchParams;

    const pageValue = Number(
      searchParams.get("page"),
    );

    const pageSizeValue =
      Number(
        searchParams.get("pageSize"),
      );

    const data =
      await getUsersDirectoryData({
        search:
          searchParams.get(
            "search",
          ) ?? "",
        roleId:
          searchParams.get(
            "roleId",
          ) ?? "",
        page:
          Number.isInteger(
            pageValue,
          ) && pageValue > 0
            ? pageValue
            : 1,
        pageSize:
          Number.isInteger(
            pageSizeValue,
          ) &&
          pageSizeValue > 0
            ? pageSizeValue
            : 20,
      });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}