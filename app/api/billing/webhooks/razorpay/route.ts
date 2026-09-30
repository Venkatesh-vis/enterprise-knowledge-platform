import { NextResponse } from "next/server";
import { receiveWebhook } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    await receiveWebhook(rawBody, signature);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Razorpay webhook API");
  }
}
