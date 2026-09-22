import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { errorResponse } from "@/lib/http/api-error";
import {
  acceptInvitationForExistingUser,
  acceptInvitationForNewUser,
} from "@/lib/invitations/service";
import {
  acceptExistingInvitationSchema,
  acceptInvitationSchema,
} from "@/lib/invitations/validation";
import { createAccessToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookie";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body?.mode === "existing") {
      const input =
        acceptExistingInvitationSchema.parse(
          body,
        );
      const result =
        await acceptInvitationForExistingUser(
          input.token,
        );

      return NextResponse.json({
        success: true,
        message: result.alreadyMember
          ? "You are already a member of this organization."
          : "Invitation accepted.",
        data: {
          ...result,
          redirectTo: "/dashboard",
        },
      });
    }

    if (body?.mode !== "new") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invitation acceptance mode is required.",
        },
        { status: 400 },
      );
    }

    const input =
      acceptInvitationSchema.parse(body);
    const passwordHash = await bcrypt.hash(
      input.password,
      12,
    );
    const result =
      await acceptInvitationForNewUser({
        token: input.token,
        name: input.name,
        passwordHash,
      });

    await setAuthCookie(
      await createAccessToken(
        result.userId,
      ),
    );

    return NextResponse.json({
      success: true,
      message:
        "Account created and invitation accepted.",
      data: {
        ...result,
        redirectTo: "/dashboard",
      },
    });
  } catch (error) {
    return errorResponse(
      error,
      "Accept invitation API",
    );
  }
}
