import { NextResponse } from "next/server";
import { getInvoiceDownloadUrl } from "@/lib/billing/service";
import { errorResponse } from "@/lib/http/api-error";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const invoiceId = url.searchParams.get("invoiceId") ?? "";
    const downloadUrl = await getInvoiceDownloadUrl(invoiceId);

    return NextResponse.redirect(downloadUrl, 302);
  } catch (error) {
    return errorResponse(error, "Billing invoice API");
  }
}
