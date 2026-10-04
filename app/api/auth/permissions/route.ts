import { NextResponse } from "next/server";
import { getAuthenticatedRequest } from "@/lib/auth";
import { Permission, RolePermission } from "@/db/models";
import { checkApiRateLimit } from "@/lib/http/api-rate-limit";

export async function GET(request: Request) {
  const rateLimitResponse = await checkApiRateLimit(request, {
    limit: 60,
    windowSeconds: 60,
    keyPrefix: "auth-permissions",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const auth = await getAuthenticatedRequest(request);

    if (!auth?.membership?.roleId) {
      return NextResponse.json(
        { message: "User role is not configured." },
        { status: 403 },
      );
    }

    const roleId = auth.membership.roleId;
    const rolePermissions = await RolePermission.findAll({
      where: { roleId },
      include: [{ model: Permission, as: "permission", attributes: ["key"] }],
    });
    const permissions = rolePermissions
      .map((item: any) => item.permission?.key)
      .filter(Boolean);

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Permissions error:", error);
    return NextResponse.json(
      { message: "Unable to load permissions." },
      { status: 401 },
    );
  }
}
