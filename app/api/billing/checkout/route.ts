import { NextResponse } from "next/server";
import { z } from "zod";
import { createSubscription } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";
const schema = z.object({ planId: z.string().uuid(), idempotencyKey: z.string().min(8).max(191) });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    return NextResponse.json({ success: true, data: await createSubscription(body.planId, body.idempotencyKey) }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Billing checkout API");
  }
}
