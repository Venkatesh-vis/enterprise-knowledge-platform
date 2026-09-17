import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "@/db/models/user";
import OrganizationMembership from "@/db/models/organization-membership";
import {createAccessToken,} from "@/lib/auth/jwt";

import {
  setAuthCookie,
} from "@/lib/auth/cookie";

export const runtime =
  "nodejs";

const loginSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email(),

    password: z
      .string()
      .min(1),
  });

function errorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}

export async function POST(
  request: Request,
) {
  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return errorResponse(
      "Invalid request.",
      400,
    );
  }

  const parsed =
    loginSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "Email and password are required.",
      400,
    );
  }

  const email =
    parsed.data.email
      .trim()
      .toLowerCase();

  const password =
    parsed.data.password;

  try {
    const user =
      await User.findOne({
        where: {
          email,
        },

        attributes: [
          "id",
          "passwordHash",
        ],

        raw: true,
      });

    if (
      !user ||
      typeof user.passwordHash !==
        "string"
    ) {
      return errorResponse(
        "Invalid email or password.",
        401,
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!passwordMatches) {
      return errorResponse(
        "Invalid email or password.",
        401,
      );
    }

    const membership =
      await OrganizationMembership.findOne(
        {
          where: {
            userId: user.id,
          },

          attributes: ["id"],

          raw: true,
        },
      );

    if (!membership) {
      return errorResponse(
        "Your account is not associated with an organization.",
        403,
      );
    }

    const token =
      await createAccessToken(
        user.id,
      );

    await setAuthCookie(
      token,
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Login successful.",
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
    console.error(
      "Login error:",
      error,
    );

    return errorResponse(
      "Unable to sign in. Please try again.",
      500,
    );
  }
}