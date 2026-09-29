import { NextResponse } from "next/server";

import { BillingServiceError, verifyCheckout } from "@/lib/billing/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.subscriptionId || !body?.paymentId || !body?.signature) {
      return NextResponse.json({ success: false, message: "Incomplete payment verification payload." }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: await verifyCheckout({ subscriptionId: body.subscriptionId, paymentId: body.paymentId, signature: body.signature }) });
  } catch (error) {
    if (error instanceof BillingServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("Billing verification error:", error);
    return NextResponse.json({ success: false, message: "Payment verification failed." }, { status: 500 });
  }
}
