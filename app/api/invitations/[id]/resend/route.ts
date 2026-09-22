import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/api-error";
import { resendInvitation } from "@/lib/invitations/service";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await resendInvitation(id);
    return NextResponse.json({ success: true, message: result.emailSent ? "Invitation resent." : "Invitation renewed, but email delivery failed.", data: result });
  } catch (error) {
    return errorResponse(error, "Resend invitation API");
  }
}
