import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/api-error";
import { getInvitationDetail } from "@/lib/invitations/service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: await getInvitationDetail(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Invitation detail API");
  }
}
