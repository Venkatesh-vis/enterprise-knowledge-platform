export type BillingCycle = "monthly" | "yearly";

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  interval: string;
  price: number;
  currency: string;
  features: string[];
  limits: Record<string, number | null>;
};

export type Payment = {
  id: string;
  paymentId: string;
  invoiceId?: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  capturedAt: string | null;
  createdAt: string | null;
  refundedAmount: number;
};

export type Billing = {
  plan: Plan;
  subscriptionStatus: string;
  subscriptionId: string | null;
  razorpaySubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  usage: Record<string, number>;
  payments: Payment[];
};

export type PaymentSourcePlan = {
  name: string;
  description: string;
  monthlyPrice: number;
  limits: {
    users: string;
    storage: string;
    knowledge_bases: string;
    usage_credits: string;
  };
};
