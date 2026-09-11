"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import type {
  BillingCycle,
  Plan,
} from "./pricing-page";

interface PricingCardProps {
  plan: Plan;
  selected: boolean;
  billingCycle: BillingCycle;
  yearlyDiscount: number;
  onSelect: () => void;
}

export function PricingCard({
  plan,
  selected,
  billingCycle,
  yearlyDiscount,
  onSelect,
}: PricingCardProps) {
  const yearlyMonthlyPrice = Math.round(
    plan.monthlyPrice *
      (1 - yearlyDiscount / 100),
  );

  const displayedPrice =
    billingCycle === "yearly"
      ? yearlyMonthlyPrice
      : plan.monthlyPrice;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Select ${plan.name} plan`}
      whileHover={{
        y: -6,
        scale: 1.01,
      }}
      whileTap={{
        scale: 0.985,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className={[
        "group relative flex h-full min-h-[680px] w-full flex-col overflow-hidden rounded-2xl p-[1px] text-left",
        "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",

        selected
          ? "bg-gradient-to-br from-indigo-400 via-violet-500 to-cyan-400 shadow-2xl shadow-indigo-500/25"
          : "bg-slate-200 shadow-sm hover:bg-slate-300",
      ].join(" ")}
    >
      {/* Animated border */}
      {selected && (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[80%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,rgba(255,255,255,0.95)_280deg,rgba(165,243,252,0.9)_300deg,rgba(129,140,248,0.9)_320deg,transparent_350deg)]"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[60%] bg-[conic-gradient(from_180deg,transparent_0deg,transparent_275deg,rgba(255,255,255,0.75)_300deg,transparent_330deg)]"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </>
      )}

      {/* Card surface */}
      <div
        className={[
          "relative z-10 flex h-full flex-1 flex-col overflow-hidden rounded-[15px] p-6 sm:p-7",

          selected
            ? "bg-gradient-to-br from-indigo-50 via-white to-cyan-50"
            : "bg-white",
        ].join(" ")}
      >
        {/* Shimmer */}
        {selected && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 z-20 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/90 to-transparent"
            animate={{
              left: [
                "-50%",
                "130%",
              ],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 1.8,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Ambient color */}
        {selected && (
          <>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.45, 0.75, 0.45],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}

        {/* Yearly savings tag */}
        {billingCycle === "yearly" && (
          <div className="pointer-events-none absolute right-[-42px] top-[18px] z-40 w-36 rotate-45 bg-emerald-500 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
            Save {yearlyDiscount}%
          </div>
        )}

        {/* Selected indicator */}
        <motion.div
          aria-hidden="true"
          animate={{
            scale: selected ? 1 : 0.9,
          }}
          transition={{
            duration: 0.25,
          }}
          className={[
            "absolute right-5 top-5 z-30 flex h-6 w-6 items-center justify-center rounded-full border",

            selected
              ? "border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-500/30"
              : "border-slate-300 bg-white",
          ].join(" ")}
        >
          {selected && (
            <motion.div
              initial={{
                scale: 0,
                rotate: -45,
              }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 0.3,
                ease: [
                  0.34,
                  1.56,
                  0.64,
                  1,
                ],
              }}
            >
              <Check
                className="h-3.5 w-3.5 text-white"
                strokeWidth={3}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        <div className="relative z-30 flex h-full flex-1 flex-col">
          {/* Plan header */}
          <div className="min-h-[108px] pr-12">
            {plan.popular && (
              <motion.span
                animate={
                  selected
                    ? {
                        scale: [
                          1,
                          1.04,
                          1,
                        ],
                      }
                    : undefined
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-3 inline-flex rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
              >
                Most popular
              </motion.span>
            )}

            {!plan.popular && (
              <div className="mb-3 h-[26px]" />
            )}

            <h2 className="text-lg font-semibold text-slate-950">
              {plan.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {plan.description}
            </p>
          </div>

          {/* Price */}
          <div className="mt-6 min-h-[90px]">
            <div className="flex items-end gap-1">
              <span className="text-3xl font-semibold tracking-tight text-slate-950">
                ₹
                {displayedPrice.toLocaleString(
                  "en-IN",
                )}
              </span>

              <span className="mb-1 text-sm text-slate-500">
                / month
              </span>
            </div>

            {billingCycle === "yearly" ? (
              <p className="mt-1 text-xs text-emerald-600">
                Billed monthly · annual commitment
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Billed monthly
              </p>
            )}
          </div>

          {/* Limits */}
          <div className="mt-7 border-t border-slate-200/70 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Plan includes
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
              {plan.limits.map((limit) => (
                <div key={limit.label}>
                  <dt className="text-xs text-slate-400">
                    {limit.label}
                  </dt>

                  <dd className="mt-0.5 text-sm font-semibold text-slate-700">
                    {limit.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Features */}
          <div className="mt-7 flex-1 border-t border-slate-200/70 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Features
            </p>

            <ul className="mt-4 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature.name}
                  className="flex items-start gap-3 text-sm"
                >
                  {feature.included ? (
                    <Check
                      className={[
                        "mt-0.5 h-4 w-4 shrink-0",
                        selected
                          ? "text-indigo-600"
                          : "text-emerald-600",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  ) : (
                    <X
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-300"
                      aria-hidden="true"
                    />
                  )}

                  <span
                    className={
                      feature.included
                        ? "text-slate-700"
                        : "text-slate-400"
                    }
                  >
                    {feature.name}
                  </span>

                  <span className="sr-only">
                    {feature.included
                      ? "Included"
                      : "Not included"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.button>
  );
}