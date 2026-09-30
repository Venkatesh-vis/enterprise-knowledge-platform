import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySubscriptionPayment } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";
const schema = z.object({ subscriptionId: z.string().uuid(), razorpaySubscriptionId: z.string().min(1), razorpayPaymentId: z.string().min(1), razorpaySignature: z.string().min(1) });

export async function POST(request: Request) {
  try {
    return NextResponse.json({ success: true, data: await verifySubscriptionPayment(schema.parse(await request.json())) });
  } catch (error) {
    return errorResponse(error, "Billing verification API");
  }
}
