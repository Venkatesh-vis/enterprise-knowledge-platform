import { NextResponse } from "next/server";

import { BillingInvoice } from "@/db/models";
import { requirePermission } from "@/lib/auth/authorization";

export const runtime = "nodejs";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermission("BILLING_READ");
    const { id } = await params;
    const invoice = await BillingInvoice.findOne({
      where: { id, organizationId: auth.organization.id },
      raw: true,
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found." }, { status: 404 });
    }

    const url = new URL(request.url);
    const download = url.searchParams.get("download") === "1";
    if (!download) {
      return NextResponse.json({ success: true, data: invoice }, { headers: { "Cache-Control": "no-store" } });
    }

    const details = (invoice.details ?? {}) as Record<string, unknown>;
    const amount = (Number(invoice.amountPaise) / 100).toLocaleString("en-IN", { style: "currency", currency: invoice.currency });
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(invoice.invoiceNumber ?? invoice.id)}</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#0f172a}main{max-width:760px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:24px}.muted{color:#64748b}.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f1f5f9}.total{font-size:22px;font-weight:700;margin-top:18px;text-align:right}@media print{body{margin:0}}</style></head><body><main><header><div><h1>Invoice</h1><div class="muted">${escapeHtml(invoice.invoiceNumber ?? invoice.razorpayInvoiceId)}</div></div><div><strong>Enterprise Knowledge Platform</strong><br><span class="muted">${escapeHtml(invoice.status)}</span></div></header><section><p><strong>Billed to</strong><br>${escapeHtml(invoice.customerName)}<br>${escapeHtml(invoice.customerEmail)}</p><div class="row"><span>Plan</span><strong>${escapeHtml(details.planKey)}</strong></div><div class="row"><span>Billing cycle</span><strong>${escapeHtml(details.billingCycle)}</strong></div><div class="row"><span>Razorpay invoice</span><strong>${escapeHtml(invoice.razorpayInvoiceId)}</strong></div><div class="row"><span>Payment</span><strong>${escapeHtml(invoice.paymentId ?? "Pending")}</strong></div><div class="total">Total: ${escapeHtml(amount)}</div></section></main></body></html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="invoice-${String(invoice.invoiceNumber ?? invoice.id).replace(/[^a-zA-Z0-9_-]/g, "_")}.html"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Invoice API error:", error);
    return NextResponse.json({ success: false, message: "Unable to retrieve invoice." }, { status: 500 });
  }
}
