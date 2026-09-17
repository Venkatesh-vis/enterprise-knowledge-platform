import { NextResponse } from "next/server";

import {
  requirePermission,
  AuthorizationError,
} from "@/lib/auth/authorization";

import Role from "@/db/models/role";

export async function GET() {
  try {
    await requirePermission(
      "USER_READ",
    );

    const roles =
      await Role.findAll({
        where: {
          isSystemRole: true,
          key: [
            "OWNER",
            "ADMIN",
            "MANAGER",
            "MEMBER",
          ],
        },
        attributes: [
          "id",
          "key",
          "name",
          "description",
          "isSystemRole",
        ],
        order: [
          ["name", "ASC"],
        ],
        raw: true,
      });

    return NextResponse.json({
      success: true,
      data: {
        roles,
      },
    });
  } catch (error) {
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

    console.error(
      "Roles API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load roles.",
      },
      {
        status: 500,
      },
    );
  }
}