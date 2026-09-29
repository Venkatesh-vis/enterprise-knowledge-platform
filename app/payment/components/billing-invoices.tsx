"use client";

import { Download, ExternalLink } from "lucide-react";

export type BillingInvoiceItem = {
  id: string;
  invoiceNumber: string | null;
  razorpayInvoiceId: string;
  status: string;
  amountPaise: number | string;
  currency: string;
  hostedUrl: string | null;
  createdAt: string;
};

export function BillingInvoices({ invoices }: { invoices: BillingInvoiceItem[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-950">Invoices</h2>
          <p className="mt-1 text-sm text-slate-500">Payment history and downloadable invoice details.</p>
        </div>
        {invoices.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No invoices have been issued yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{invoice.invoiceNumber ?? invoice.razorpayInvoiceId}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(invoice.createdAt).toLocaleDateString("en-IN")} · {invoice.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-800">₹{(Number(invoice.amountPaise) / 100).toLocaleString("en-IN")}</span>
                  {invoice.hostedUrl && <a href={invoice.hostedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><ExternalLink className="h-3.5 w-3.5" />Razorpay</a>}
                  <a href={`/api/billing/invoices/${invoice.id}?download=1`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"><Download className="h-3.5 w-3.5" />Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
