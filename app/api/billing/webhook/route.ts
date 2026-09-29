import { NextResponse } from "next/server";

import { processWebhookEvent } from "@/lib/billing/service";
import { verifyWebhookSignature } from "@/lib/billing/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");

  if (!signature || !eventId) {
    return NextResponse.json({ success: false, message: "Missing Razorpay webhook headers." }, { status: 400 });
  }

  try {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ success: false, message: "Invalid webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    if (!payload?.event) {
      return NextResponse.json({ success: false, message: "Invalid webhook payload." }, { status: 400 });
    }

    await processWebhookEvent(eventId, payload.event, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ success: false, message: "Webhook processing failed." }, { status: 500 });
  }
}
