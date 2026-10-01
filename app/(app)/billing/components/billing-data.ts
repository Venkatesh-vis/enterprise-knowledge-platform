import type { PaymentSourcePlan } from "./billing-types";

export const PAYMENT_PLANS: readonly PaymentSourcePlan[] = [
  {
    name: "Starter",
    description: "For small teams getting started with centralized knowledge.",
    monthlyPrice: 999,
    limits: {
      users: "10",
      storage: "25 GB",
      knowledge_bases: "5",
      usage_credits: "1,000 / month",
    },
  },
  {
    name: "Business",
    description: "For growing organizations that need advanced controls and collaboration.",
    monthlyPrice: 2999,
    limits: {
      users: "50",
      storage: "100 GB",
      knowledge_bases: "20",
      usage_credits: "10,000 / month",
    },
  },
  {
    name: "Enterprise",
    description: "For organizations requiring maximum control, security and scale.",
    monthlyPrice: 7999,
    limits: {
      users: "250",
      storage: "500 GB",
      knowledge_bases: "100",
      usage_credits: "50,000 / month",
    },
  },
];

export const YEARLY_DISCOUNT = 20;
