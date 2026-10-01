import { NextResponse } from "next/server";

import { getWorkspaceOverview } from "@/lib/workspace/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

export async function GET() {
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
