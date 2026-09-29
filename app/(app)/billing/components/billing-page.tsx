import { Download, ExternalLink, FileText } from "lucide-react";

import { getBillingInvoicesPageData } from "@/lib/billing/service";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) / 100);
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (["paid", "captured", "authorized"].includes(value)) return "bg-emerald-50 text-emerald-700";
  if (["issued", "created"].includes(value)) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export async function BillingPage() {
  const { organization, invoices } = await getBillingInvoicesPageData();

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Management</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Billing</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          View invoice details and download payment records for {organization.name}.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Invoice history</h2>
              <p className="mt-1 text-sm text-slate-500">Detailed invoices and protected downloads.</p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </span>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">No invoices yet</p>
            <p className="mt-1 text-sm text-slate-400">Invoices will appear here after a Razorpay payment is issued.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <article key={invoice.id} className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-950">
                        {invoice.invoiceNumber ?? invoice.razorpayInvoiceId}
                      </h3>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${statusClass(invoice.status)}`}>
                        {invoice.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Razorpay invoice: {invoice.razorpayInvoiceId}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-semibold text-slate-950">
                      {formatAmount(invoice.amountPaise, invoice.currency)}
                    </span>
                    {invoice.hostedUrl && (
                      <a href={invoice.hostedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        <ExternalLink className="h-3.5 w-3.5" /> Razorpay invoice
                      </a>
                    )}
                    <a href={`/api/billing/invoices/${invoice.id}?download=1`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </div>
                </div>

                <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Invoice date</dt><dd className="mt-1 text-sm font-medium text-slate-700">{formatDate(invoice.issuedAt ?? invoice.createdAt)}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Paid date</dt><dd className="mt-1 text-sm font-medium text-slate-700">{formatDate(invoice.paidAt)}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Plan</dt><dd className="mt-1 text-sm font-medium capitalize text-slate-700">{invoice.details?.planKey ?? "—"}{invoice.details?.billingCycle ? ` · ${invoice.details.billingCycle}` : ""}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payment</dt><dd className="mt-1 truncate text-sm font-medium text-slate-700">{invoice.paymentId ?? "Pending"}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Billed to</dt><dd className="mt-1 text-sm font-medium text-slate-700">{invoice.customerName}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Customer email</dt><dd className="mt-1 truncate text-sm font-medium text-slate-700">{invoice.customerEmail}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Amount paid</dt><dd className="mt-1 text-sm font-medium text-slate-700">{formatAmount(invoice.amountPaidPaise, invoice.currency)}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Currency</dt><dd className="mt-1 text-sm font-medium text-slate-700">{invoice.currency}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
