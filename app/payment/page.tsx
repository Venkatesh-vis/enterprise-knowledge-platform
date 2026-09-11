import type { Metadata } from "next";

import { PricingPage } from "./components/pricing-page";

export const metadata: Metadata = {
  title: "Plans & Billing",
  description:
    "Choose the right plan for your organization's knowledge platform.",
};

export default function PaymentPage() {
  return <PricingPage />;
}
