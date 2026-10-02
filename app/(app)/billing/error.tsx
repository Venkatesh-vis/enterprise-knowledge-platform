"use client";

import { BillingError } from "./components/billing-error";

export default function BillingRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <BillingError reset={reset} />;
}
