import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type BillingMessagesProps = {
  error: string;
  message: string;
};

export function BillingMessages({
  error,
  message,
}: BillingMessagesProps) {
  return (
    <>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          {message}
        </div>
      )}
    </>
  );
}
