import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/api-error";
import { revokeInvitation } from "@/lib/invitations/service";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, message: "Invitation revoked.", data: await revokeInvitation(id) });
  } catch (error) {
    return errorResponse(error, "Revoke invitation API");
  }
}
