"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  BrainCircuit,
  FileSearch,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    eyebrow: "Knowledge",
    title: "One place for your documents",
    description:
      "Bring policies, handbooks, architecture docs and operational knowledge into one organized workspace.",
    iconClass:
      "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  {
    icon: BrainCircuit,
    eyebrow: "Intelligence",
    title: "Answers grounded in your data",
    description:
      "Ask questions naturally and retrieve useful answers from the documents your organization actually owns.",
    iconClass:
      "bg-violet-50 text-violet-600 ring-violet-100",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Control",
    title: "Built around secure access",
    description:
      "Organizations, roles, permissions and document access controls keep sensitive knowledge in the right hands.",
    iconClass:
      "bg-cyan-50 text-cyan-600 ring-cyan-100",
  },
];

export function FeaturesSection() {
  const shouldReduceMotion =
    useReducedMotion();

  return (
    <section
      id="features"
      className="border-y border-slate-200/80 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.65,
          }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
            Why it exists
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Less searching.
            <span className="block text-slate-400">
              More knowing.
            </span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            Everything is designed around one goal: make
            organizational knowledge easier to find, safer
            to share and more useful to your team.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map(
            (feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  key={feature.title}
                  initial={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          y: 24,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.55,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -7,
                        }
                  }
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <motion.div
                    whileHover={{
                      scale: 1.08,
                      rotate: -3,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${feature.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>

                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {feature.eyebrow}
                  </p>

                  <h3 className="mt-2 text-base font-semibold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </motion.article>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}