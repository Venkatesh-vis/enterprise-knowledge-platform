import { NextResponse } from "next/server";
import { z } from "zod";
import { upgradeSubscription } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

const schema = z.object({
  planId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    return NextResponse.json(
      { success: true, data: await upgradeSubscription(body.planId) },
      { status: 200 },
    );
  } catch (error) {
    return errorResponse(error, "Billing upgrade API");
  }
}
