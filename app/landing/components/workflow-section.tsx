"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  BrainCircuit,
  FileUp,
  Search,
  ShieldCheck,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    number: "01",
    icon: FileUp,
    title: "Bring knowledge in",
    description:
      "Upload the documents your team already relies on.",
    tone: "indigo",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Control access",
    description:
      "Organize people, roles and access around the workspace.",
    tone: "violet",
  },
  {
    number: "03",
    icon: Search,
    title: "Find what matters",
    description:
      "Search and filter across your growing knowledge base.",
    tone: "cyan",
  },
  {
    number: "04",
    icon: BrainCircuit,
    title: "Ask your AI",
    description:
      "Get answers grounded in the knowledge your team trusts.",
    tone: "emerald",
  },
];

export function WorkflowSection() {
  const shouldReduceMotion =
    useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#f8faff]"
    >
      <motion.div
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                rotate: [0, 360],
              }
        }
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none absolute right-[-180px] top-20 h-[360px] w-[360px] rounded-full border border-indigo-100/80"
      />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            From document to answer.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            A straightforward workflow that turns static
            documents into accessible organizational knowledge.
          </p>
        </motion.div>

        <div className="relative mt-14">
          <motion.div
            initial={{
              scaleX: 0,
            }}
            whileInView={{
              scaleX: 1,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden origin-left border-t border-dashed border-indigo-200 md:block"
          />

          <div className="grid gap-5 md:grid-cols-4">
            {WORKFLOW_STEPS.map(
              (step, index) => {
                const Icon = step.icon;

                const toneClasses = {
                  indigo:
                    "bg-indigo-50 text-indigo-600 ring-indigo-100",
                  violet:
                    "bg-violet-50 text-violet-600 ring-violet-100",
                  cyan:
                    "bg-cyan-50 text-cyan-600 ring-cyan-100",
                  emerald:
                    "bg-emerald-50 text-emerald-600 ring-emerald-100",
                }[step.tone];

                return (
                  <motion.article
                    key={step.number}
                    initial={{
                      opacity: 0,
                      y: 20,
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
                      delay: index * 0.1,
                      duration: 0.5,
                    }}
                    whileHover={{
                      y: -5,
                    }}
                    className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <motion.span
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : {
                                opacity: [
                                  0.4,
                                  0.8,
                                  0.4,
                                ],
                              }
                        }
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.25,
                        }}
                        className="text-xs font-bold tracking-wide text-slate-300"
                      >
                        {step.number}
                      </motion.span>

                      <motion.div
                        whileHover={{
                          scale: 1.08,
                          rotate: 4,
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${toneClasses}`}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                    </div>

                    <h3 className="mt-7 text-sm font-semibold text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </motion.article>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}