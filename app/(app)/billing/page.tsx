import type { Metadata } from "next";

import { BillingPage } from "./components/billing-page";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your organization's plan, payments and invoices.",
};

export default function BillingRoutePage() {
  return <BillingPage />;
}
