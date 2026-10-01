"use client";

import {
  Download,
  FileText,
  ReceiptText,
} from "lucide-react";

import { formatDate, formatMoney } from "./billing-utils";
import type { Billing } from "./billing-types";

type InvoiceHistoryProps = {
  billing: Billing | null;
  invoiceFrom: string;
  invoiceTo: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
};

export function InvoiceHistory({
  billing,
  invoiceFrom,
  invoiceTo,
  onFromChange,
  onToChange,
  onApply,
  onClear,
}: InvoiceHistoryProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Invoices & payment history</h2>
              <p className="text-sm text-slate-500">Filter, review, and download invoices for any billing period.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              From
              <input
                type="date"
                value={invoiceFrom}
                max={invoiceTo || undefined}
                onChange={(event) => onFromChange(event.target.value)}
                className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-slate-400"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              To
              <input
                type="date"
                value={invoiceTo}
                min={invoiceFrom || undefined}
                onChange={(event) => onToChange(event.target.value)}
                className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none focus:border-slate-400"
              />
            </label>
            <button
              type="button"
              onClick={onApply}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {billing?.payments?.length ? (
        <>
          <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Invoices</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{billing.payments.length.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Captured amount</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {formatMoney(
                  billing.payments.filter((payment) => payment.status === "CAPTURED").reduce((total, payment) => total + payment.amount, 0),
                  billing.payments[0]?.currency ?? "INR",
                )}
              </p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Refunded amount</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {formatMoney(
                  billing.payments.reduce((total, payment) => total + payment.refundedAmount, 0),
                  billing.payments[0]?.currency ?? "INR",
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">Invoice</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Method</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Amount</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billing.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{payment.invoiceId ?? payment.paymentId}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{payment.invoiceId ? "Razorpay invoice" : "Payment receipt"}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(payment.capturedAt ?? payment.createdAt)}</td>
                    <td className="px-6 py-4 capitalize text-slate-600">{payment.method ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={[
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        payment.status === "CAPTURED"
                          ? "bg-emerald-50 text-emerald-700"
                          : payment.status === "FAILED"
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-600",
                      ].join(" ")}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatMoney(payment.amount, payment.currency)}</td>
                    <td className="px-6 py-4 text-right">
                      {payment.invoiceId ? (
                        <a
                          href={"/api/billing/invoice?invoiceId=" + encodeURIComponent(payment.invoiceId)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Not available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-6 py-14 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No invoices in this period</p>
          <p className="mt-1 text-sm text-slate-400">Try widening the From / To range or complete a payment.</p>
        </div>
      )}
    </section>
  );
}
