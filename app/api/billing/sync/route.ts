import { NextResponse } from "next/server";
import { syncCurrentSubscription } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      data: await syncCurrentSubscription(),
    });
  } catch (error) {
    return errorResponse(error, "Billing sync API");
  }
}
