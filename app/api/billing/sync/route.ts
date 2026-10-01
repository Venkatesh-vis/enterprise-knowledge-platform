import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { syncCurrentSubscription } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

async function handlePOST() {
  try {
    return NextResponse.json({
      success: true,
      data: await syncCurrentSubscription(),
    });
  } catch (error) {
    return errorResponse(error, "Billing sync API");
  }
}

export const POST = withApiMiddleware(handlePOST, {
  permission: "BILLING_READ",
  context: "POST app/api/billing/sync/route.ts API",
});
