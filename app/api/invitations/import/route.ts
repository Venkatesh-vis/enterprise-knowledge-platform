import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { errorResponse } from "@/lib/http/api-error";
import { importInvitations } from "@/lib/invitations/service";
import { importInvitationSchema } from "@/lib/invitations/validation";

async function POST(request: Request) {
  try {
    const body = await request.json();
    const invitations = importInvitationSchema.parse(body?.invitations);
    const result = await importInvitations(invitations);
    return NextResponse.json({ success: true, message: "Import completed.", data: result }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Invitation import API");
  }
}

export const POST = withApiMiddleware(POST, {
  permission: "INVITATION_IMPORT",
  context: "POST app/api/invitations/import/route.ts API",
});
