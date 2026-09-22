import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AuthenticationError,
  AuthorizationError,
} from "@/lib/auth/authorization";
import { InvitationServiceError } from "@/lib/invitations/service";

export function errorResponse(error: unknown, context: string) {
  if (error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof InvitationServiceError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status },
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { success: false, message: error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  console.error(`${context}:`, error);
  return NextResponse.json(
    { success: false, message: "An unexpected error occurred." },
    { status: 500 },
  );
}
