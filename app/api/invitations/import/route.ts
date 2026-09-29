import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/authorization";
import { assertCanAddUsers, PlanLimitError } from "@/lib/billing/limits";
import { errorResponse } from "@/lib/http/api-error";
import { importInvitations } from "@/lib/invitations/service";
import { importInvitationSchema } from "@/lib/invitations/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invitations = importInvitationSchema.parse(body?.invitations);
    const auth = await requirePermission("INVITATION_IMPORT");
    const uniqueEmails = new Set(invitations.map((item) => String(item.email).trim().toLowerCase()));
    await assertCanAddUsers(auth.organization.id, uniqueEmails.size);
    const result = await importInvitations(invitations);
    return NextResponse.json({ success: true, message: "Import completed.", data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof PlanLimitError) return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    return errorResponse(error, "Invitation import API");
  }
}
