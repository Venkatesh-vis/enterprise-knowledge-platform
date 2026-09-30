import { NextResponse } from "next/server";
import { getCurrentEntitlement, getBillingPayments } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [billing, payments] = await Promise.all([getCurrentEntitlement(), getBillingPayments()]);
    return NextResponse.json({ success: true, data: { ...billing, payments } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Billing state API");
  }
}
