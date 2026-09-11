import { NextResponse } from "next/server";
import {getCurrentUser,} from "@/lib/auth/get-current-user";


export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        user: {
          id: currentUser.userId,
        },
        organization: {
          id: currentUser.organizationId,
        },
        membership: {
          id: currentUser.membershipId,
          role: currentUser.role,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}