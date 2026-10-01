import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { errorResponse } from "@/lib/http/api-error";
import { revokeInvitation } from "@/lib/invitations/service";

async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, message: "Invitation revoked.", data: await revokeInvitation(id) });
  } catch (error) {
    return errorResponse(error, "Revoke invitation API");
  }
}

export const POST = withApiMiddleware(POST, {
  permission: "INVITATION_REVOKE",
  context: "POST app/api/invitations/[id]/revoke/route.ts API",
});
