import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { z } from "zod";
import { upgradeSubscription } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

const schema = z.object({
  planId: z.string().uuid(),
});

async function handlePOST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    return NextResponse.json(
      { success: true, data: await upgradeSubscription(body.planId) },
      { status: 200 },
    );
  } catch (error) {
    return errorResponse(error, "Billing upgrade API");
  }
}

export const POST = withApiMiddleware(handlePOST, {
  permission: "BILLING_MANAGE",
  context: "POST app/api/billing/upgrade/route.ts API",
});
