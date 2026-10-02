import { Sparkles } from "lucide-react";

export function BillingNotes() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Billing notes</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Yearly billing applies the same 20% discount defined on the Payment page.
            Subscription state and entitlement enforcement remain server-controlled.
          </p>
        </div>
      </div>
    </section>
  );
}
