import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  AuthenticationError,
  AuthorizationError,
} from "@/lib/auth/authorization";

import {
  getUserDetailData,
  removeOrganizationUser,
  updateOrganizationUserRole,
  UserServiceError,
} from "@/lib/users/user-service";

import {
  updateUserRoleSchema,
} from "@/lib/users/validation";

function errorResponse(error: unknown) {
  if (
    error instanceof AuthenticationError
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

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        message:
          error.issues[0]?.message ??
          "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  console.error(
    "User API error:",
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
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const data =
      await getUserDetailData(id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const parsed =
      updateUserRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsed.error.issues[0]?.message ??
            "Invalid request.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await updateOrganizationUserRole(
        id,
        parsed.data,
      );

    return NextResponse.json({
      success: true,
      message:
        "User role updated successfully.",
      data: result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await removeOrganizationUser(id);

    return NextResponse.json({
      success: true,
      message:
        "User removed from the organization.",
      data: result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}