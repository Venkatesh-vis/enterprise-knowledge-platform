"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "₹999",
    description: "For small teams getting started.",
    popular: false,
    features: [
      "Knowledge workspace",
      "Document management",
      "AI assistant",
      "Up to 10 users",
      "100 documents",
      "5 GB storage",
      "500 Usage Credits / month",
      "3 knowledge bases",
    ],
  },

  {
    name: "Business",
    price: "₹2,999",
    description: "For growing organizations.",
    popular: true,
    features: [
      "Everything in Starter",
      "Up to 50 users",
      "1,000 documents",
      "50 GB storage",
      "5,000 Usage Credits / month",
      "20 knowledge bases",
      "Advanced RBAC",
      "Audit logs",
      "Advanced analytics",
    ],
  },

  {
    name: "Enterprise",
    price: "₹7,999",
    description: "For organizations operating at scale.",
    popular: false,
    features: [
      "Everything in Business",
      "Up to 250 users",
      "10,000 documents",
      "500 GB storage",
      "50,000 Usage Credits / month",
      "Unlimited knowledge bases",
      "Advanced security controls",
      "Enterprise administration",
      "Priority support",
    ],
  },
];


export function PricingSection() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="border-t border-slate-200/70 bg-[#f8faff]"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
            <Sparkles
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            Simple, predictable pricing
          </div>

          <h2
            id="pricing-title"
            className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
          >
            Plans built for your organization
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500">
            Choose a plan based on your organization&apos;s
            size and usage needs. Every plan includes a
            defined set of platform features and monthly
            usage units.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Link
              key={plan.name}
              href="/payment"
              className="group block h-full cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4"
              aria-label={`Select ${plan.name} plan`}
            >
              <motion.article
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -6,
                }}
                whileTap={{
                  scale: 0.99,
                }}
                className={[
                  "relative flex h-full min-h-[620px] flex-col rounded-2xl border bg-white p-6 transition-shadow duration-300 sm:p-7",
                  plan.popular
                    ? "border-indigo-500 shadow-xl shadow-indigo-900/10 group-hover:shadow-2xl group-hover:shadow-indigo-500/20"
                    : "border-slate-200 shadow-sm group-hover:border-indigo-200 group-hover:shadow-xl group-hover:shadow-slate-900/10",
                ].join(" ")}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-indigo-500/20">
                    Most popular
                  </div>
                )}

                {/* Plan heading */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {plan.name}
                  </h3>

                  <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-semibold tracking-tight text-slate-950">
                      {plan.price}
                    </span>

                    <span className="mb-1 text-sm text-slate-500">
                      / month
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Includes monthly usage allowances
                  </p>
                </div>

                {/* Features */}
                <div className="mt-6 flex-1 border-t border-slate-100 pt-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Included features
                  </p>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-slate-600"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                          <Check
                            className="h-3 w-3 text-emerald-600"
                            aria-hidden="true"
                          />
                        </span>

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom action */}
                <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5 text-sm font-medium text-indigo-600">
                  <span>View plan</span>

                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </motion.article>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/payment"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2"
          >
            Compare all plans

            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}