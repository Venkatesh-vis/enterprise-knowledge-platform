import { NextResponse } from "next/server";

import { BillingServiceError, createSubscription, getBillingPageData } from "@/lib/billing/service";

export const runtime = "nodejs";

function errorResponse(error: unknown) {
  if (error instanceof BillingServiceError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  console.error("Billing API error:", error);
  return NextResponse.json({ success: false, message: "Unable to process billing request." }, { status: 500 });
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await getBillingPageData() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body?.plan !== "starter" && body?.plan !== "business" && body?.plan !== "enterprise") {
      return NextResponse.json({ success: false, message: "Invalid plan." }, { status: 400 });
    }
    if (body?.billingCycle !== "monthly" && body?.billingCycle !== "yearly") {
      return NextResponse.json({ success: false, message: "Invalid billing cycle." }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: await createSubscription(body) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
