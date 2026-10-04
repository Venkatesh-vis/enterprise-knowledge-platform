import { NextResponse } from "next/server";
import { receiveWebhook } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";
import { checkApiRateLimit } from "@/lib/http/api-rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimitResponse = await checkApiRateLimit(request, {
    limit: 60,
    windowSeconds: 60,
    keyPrefix: "razorpay-webhook",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    await receiveWebhook(rawBody, signature);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Razorpay webhook API");
  }
}
