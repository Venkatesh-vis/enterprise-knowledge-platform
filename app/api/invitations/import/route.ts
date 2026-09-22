import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/api-error";
import { importInvitations } from "@/lib/invitations/service";
import { importInvitationSchema } from "@/lib/invitations/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invitations = importInvitationSchema.parse(body?.invitations);
    const result = await importInvitations(invitations);
    return NextResponse.json({ success: true, message: "Import completed.", data: result }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Invitation import API");
  }
}
