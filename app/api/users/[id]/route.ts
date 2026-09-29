import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError } from "@/lib/auth/authorization";
import { BillingServiceError, requirePlanFeature } from "@/lib/billing/service";
import { getUserDetailData, removeOrganizationUser, updateOrganizationUserRole, UserServiceError } from "@/lib/users/user-service";
import { updateUserRoleSchema } from "@/lib/users/validation";

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof UserServiceError || error instanceof BillingServiceError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  if (error instanceof z.ZodError) return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  console.error("User API error:", error);
  return NextResponse.json({ success: false, message: "An unexpected error occurred." }, { status: 500 });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, message: "User ID is required." }, { status: 400 });
    return NextResponse.json({ success: true, data: await getUserDetailData(id) });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, message: "User ID is required." }, { status: 400 });
    const parsed = updateUserRoleSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    await requirePlanFeature("ADVANCED_RBAC");
    return NextResponse.json({ success: true, message: "User role updated successfully.", data: await updateOrganizationUserRole(id, parsed.data) });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, message: "User ID is required." }, { status: 400 });
    return NextResponse.json({ success: true, message: "User removed from the organization.", data: await removeOrganizationUser(id) });
  } catch (error) { return errorResponse(error); }
}
