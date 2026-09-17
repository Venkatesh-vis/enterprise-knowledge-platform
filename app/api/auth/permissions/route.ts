import { NextResponse } from "next/server";

import {requireAuth,} from "@/lib/auth/authorization";
import {getRolePermissions,} from "@/lib/auth/get-permissions";


export async function GET() {
  try {
    const auth = await requireAuth();

    const roleId = auth.membership.id;

    const membership =
      await import(
        "@/db/models/organization-membership"
      ).then(
        ({ default: Model }) =>
          Model.findByPk(
            roleId,
            {
              attributes: [
                "roleId",
              ],
              raw: true,
            },
          ),
      );

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Membership not found.",
        },
        {
          status: 403,
        },
      );
    }

    const permissions =
      await getRolePermissions(
        membership.roleId,
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Current permissions.",
        data: {
          permissions,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error
    ) {
      const status =
        (error as Error & {
          status: number;
        }).status;

      return NextResponse.json(
        {
          success: false,
          message:
            status === 401
              ? "Not authenticated."
              : "Forbidden.",
        },
        {
          status,
        },
      );
    }

    console.error(
      "Permissions error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load permissions.",
      },
      {
        status: 500,
      },
    );
  }
}