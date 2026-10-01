import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";

import { errorResponse } from "@/lib/http/api-error";
import { createInvitation, getInvitationPageData } from "@/lib/invitations/service";
import { createInvitationSchema, invitationListQuerySchema } from "@/lib/invitations/validation";

async function handleGET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = invitationListQuerySchema.parse({
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? "ALL",
      role: url.searchParams.get("role") ?? "ALL",
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "20",
    });
    return NextResponse.json({ success: true, data: await getInvitationPageData(input) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Invitation list API");
  }
}

async function handlePOST(request: Request) {
  try {
    const input = createInvitationSchema.parse(await request.json());
    const result = await createInvitation(input);
    return NextResponse.json({
      success: true,
      message: result.emailSent ? "Invitation sent." : "Invitation created, but email delivery failed. You can resend it.",
      data: result,
    }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Create invitation API");
  }
}

export const GET = withApiMiddleware(handleGET, {
  permission: "INVITATION_READ",
  context: "GET app/api/invitations/route.ts API",
});
export const POST = withApiMiddleware(handlePOST, {
  permission: "INVITATION_CREATE",
  resource: { resource: "team_members", amount: 1 },
  context: "POST app/api/invitations/route.ts API",
});
