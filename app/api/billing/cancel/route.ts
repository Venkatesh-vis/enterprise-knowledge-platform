import { NextResponse } from "next/server";
import { z } from "zod";
import { cancelCurrentSubscription } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";
const schema = z.object({ cancelAtPeriodEnd: z.boolean().default(true) });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    return NextResponse.json({ success: true, data: await cancelCurrentSubscription(body.cancelAtPeriodEnd) });
  } catch (error) {
    return errorResponse(error, "Billing cancellation API");
  }
}
