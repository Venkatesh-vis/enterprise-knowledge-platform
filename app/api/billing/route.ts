import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/http/api-middleware";
import { getCurrentEntitlement, getBillingPayments, syncCurrentSubscription } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    await syncCurrentSubscription().catch((error) => {
      console.error("Billing synchronization failed:", error);
    });

    const [billing, payments] = await Promise.all([
      getCurrentEntitlement(),
      getBillingPayments({ from, to }),
    ]);

    return NextResponse.json(
      { success: true, data: { ...billing, payments, filters: { from: from ?? null, to: to ?? null } } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error, "Billing state API");
  }
}

export const GET = withApiMiddleware(GET, {
  permission: "BILLING_READ",
  context: "GET app/api/billing/route.ts API",
});
