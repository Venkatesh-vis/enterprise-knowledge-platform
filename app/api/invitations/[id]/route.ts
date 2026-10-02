import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { errorResponse } from "@/lib/http/api-error";
import { getInvitationDetail } from "@/lib/invitations/service";

async function handleGET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: await getInvitationDetail(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Invitation detail API");
  }
}

export const GET = withApiMiddleware(handleGET, {
  permission: "INVITATION_READ",
  context: "GET app/api/invitations/[id]/route.ts API",
});
