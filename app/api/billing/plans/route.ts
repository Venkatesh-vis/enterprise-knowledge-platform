import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { listPlans } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

async function GET() {
  try {
    return NextResponse.json({ success: true, data: { plans: await listPlans() } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Billing plans API");
  }
}

export const GET = withApiMiddleware(GET, {
  permission: "BILLING_READ",
  context: "GET app/api/billing/plans/route.ts API",
});
