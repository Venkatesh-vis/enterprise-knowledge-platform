import { NextResponse } from "next/server";
import { listPlans } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: { plans: await listPlans() } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Billing plans API");
  }
}
