import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";

import { getWorkspaceOverview } from "@/lib/workspace/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

async function handleGET() {
  try {
    return NextResponse.json(
      {
        success: true,
        data: await getWorkspaceOverview(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return errorResponse(error, "Workspace overview API");
  }
}

export const GET = withApiMiddleware(handleGET, {
  permission: "DASHBOARD_VIEW",
  context: "GET app/api/workspace/overview/route.ts API",
});
