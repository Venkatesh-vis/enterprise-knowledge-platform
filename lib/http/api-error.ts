import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError } from "@/lib/auth/authorization";
import { InvitationServiceError } from "@/lib/invitations/service";
import { DocumentServiceError } from "@/lib/documents/service";
import { DocumentValidationError } from "@/lib/documents/validation";
import { KnowledgeBaseServiceError } from "@/lib/knowledge-bases/service";
import { BillingServiceError } from "@/lib/billing/errors";

export function errorResponse(error: unknown, context: string) {
  if (error instanceof BillingServiceError) {
    return NextResponse.json({ success: false, error: { code: error.code, message: error.message, ...(error.details ?? {}) }, message: error.message }, { status: error.status });
  }

  if (error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof InvitationServiceError || error instanceof DocumentServiceError || error instanceof DocumentValidationError || error instanceof KnowledgeBaseServiceError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  console.error(`${context}:`, error);
  return NextResponse.json({ success: false, message: "An unexpected error occurred." }, { status: 500 });
}
