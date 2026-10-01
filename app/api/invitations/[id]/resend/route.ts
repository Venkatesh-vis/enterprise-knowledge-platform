import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { errorResponse } from "@/lib/http/api-error";
import { resendInvitation } from "@/lib/invitations/service";

async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await resendInvitation(id);
    return NextResponse.json({ success: true, message: result.emailSent ? "Invitation resent." : "Invitation renewed, but email delivery failed.", data: result });
  } catch (error) {
    return errorResponse(error, "Resend invitation API");
  }
}

export const POST = withApiMiddleware(POST, {
  permission: "INVITATION_RESEND",
  context: "POST app/api/invitations/[id]/resend/route.ts API",
});
