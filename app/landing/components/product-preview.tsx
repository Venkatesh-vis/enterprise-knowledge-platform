"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  BarChart3,
  Bot,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useRef } from "react";

export function ProductPreview() {
  const shouldReduceMotion =
    useReducedMotion();

  const rotationX = useMotionValue(0);
  const rotationY = useMotionValue(0);

  const springX = useSpring(rotationX, {
    stiffness: 120,
    damping: 20,
    mass: 0.4,
  });

  const springY = useSpring(rotationY, {
    stiffness: 120,
    damping: 20,
    mass: 0.4,
  });

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (shouldReduceMotion) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
      rect.width;

    const y =
      (event.clientY - rect.top) /
      rect.height;

    rotationY.set((x - 0.5) * 4);
    rotationX.set((0.5 - y) * 3);
  }

  function handlePointerLeave() {
    rotationX.set(0);
    rotationY.set(0);
  }

  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-20 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-300/20 blur-3xl"
      />

      <motion.div
        style={{
          perspective: 1400,
        }}
        initial={{
          opacity: 0,
          y: 35,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
        className="mx-auto max-w-6xl"
      >
        <motion.div
          style={{
            rotateX: springX,
            rotateY: springY,
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  y: [0, -7, 0],
                }
          }
          transition={{
            y: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="landing-product-preview overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-25px_rgba(67,56,202,0.22)]"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />

            <div className="ml-3 hidden flex-1 justify-center sm:flex">
              <div className="flex h-8 max-w-sm flex-1 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 text-xs text-slate-400">
                <Search className="h-3.5 w-3.5" />
                Search your organization&apos;s knowledge...
              </div>
            </div>

            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 0 rgba(99,102,241,0)",
                        "0 0 20px rgba(99,102,241,0.25)",
                        "0 0 0 rgba(99,102,241,0)",
                      ],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-semibold text-white"
            >
              VV
            </motion.div>
          </div>

          <div className="grid min-h-[430px] lg:grid-cols-[210px_1fr]">
            <aside className="hidden border-r border-slate-100 bg-slate-50/75 p-4 lg:block">
              <div className="mb-5 flex items-center gap-2 px-2">
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          rotate: [0, 2, -2, 0],
                        }
                  }
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white"
                >
                  AC
                </motion.div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-800">
                    Acme Corp.
                  </p>

                  <p className="text-[9px] text-slate-400">
                    Business workspace
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <PreviewNavItem
                  icon={BarChart3}
                  label="Dashboard"
                  active
                />

                <PreviewNavItem
                  icon={FileText}
                  label="Documents"
                />

                <PreviewNavItem
                  icon={Bot}
                  label="AI Assistant"
                />

                <PreviewNavItem
                  icon={Users}
                  label="Users"
                />

                <PreviewNavItem
                  icon={ShieldCheck}
                  label="Security"
                />
              </div>

              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: [0.85, 1, 0.85],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mt-8 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />

                  <p className="text-[10px] font-semibold text-indigo-900">
                    AI usage
                  </p>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                  <motion.div
                    initial={{
                      width: "0%",
                    }}
                    whileInView={{
                      width: "64%",
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.4,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  />
                </div>

                <p className="mt-1.5 text-[9px] text-indigo-500">
                  64% of monthly allowance
                </p>
              </motion.div>
            </aside>

            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-500">
                    Organization workspace
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Knowledge overview
                  </h2>
                </div>

                <span className="inline-flex w-fit items-center rounded-lg border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                  Business
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <PreviewMetric
                  label="Documents"
                  value="248"
                  detail="+18 this month"
                  accent="indigo"
                />

                <PreviewMetric
                  label="AI questions"
                  value="1,284"
                  detail="+22% this month"
                  accent="violet"
                />

                <PreviewMetric
                  label="Knowledge coverage"
                  value="94%"
                  detail="Across 12 collections"
                  accent="cyan"
                />
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                <motion.div
                  whileHover={{
                    y: -3,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Recent documents
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Latest knowledge updates
                      </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <PreviewDocument
                      title="Engineering Architecture Guide"
                      type="PDF"
                      accent="indigo"
                    />

                    <PreviewDocument
                      title="Security Incident Response"
                      type="DOCX"
                      accent="violet"
                    />

                    <PreviewDocument
                      title="Employee Handbook"
                      type="PDF"
                      accent="cyan"
                    />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{
                    y: -3,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 p-5"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        AI Assistant
                      </p>

                      <p className="text-xs text-indigo-500">
                        Grounded in your knowledge
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <p className="text-xs leading-5 text-slate-500">
                      What is our production incident
                      escalation process?
                    </p>

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        delay: 0.3,
                        duration: 0.5,
                      }}
                      className="mt-4 rounded-lg bg-slate-50 p-3"
                    >
                      <p className="text-xs leading-5 text-slate-600">
                        Based on the Security Incident
                        Response and Operations Handbook,
                        production incidents are escalated
                        according to severity...
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-indigo-500">
                        <Sparkles className="h-3 w-3" />
                        3 source documents used
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function PreviewNavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  active?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        x: 2,
      }}
      className={[
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
        active
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
          : "text-slate-400",
      ].join(" ")}
    >
      <Icon
        aria-hidden="true"
        className={[
          "h-4 w-4",
          active
            ? "text-indigo-600"
            : "text-slate-400",
        ].join(" ")}
      />

      {label}
    </motion.div>
  );
}

function PreviewMetric({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent:
    | "indigo"
    | "violet"
    | "cyan";
}) {
  const valueColor = {
    indigo: "text-indigo-600",
    violet: "text-violet-600",
    cyan: "text-cyan-600",
  }[accent];

  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-4"
    >
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <motion.p
        initial={{
          opacity: 0,
          y: 6,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.4,
        }}
        className={`mt-2 text-2xl font-semibold tracking-tight ${valueColor}`}
      >
        {value}
      </motion.p>

      <p className="mt-1 text-xs text-slate-400">
        {detail}
      </p>
    </motion.div>
  );
}

function PreviewDocument({
  title,
  type,
  accent,
}: {
  title: string;
  type: string;
  accent:
    | "indigo"
    | "violet"
    | "cyan";
}) {
  const iconClasses = {
    indigo:
      "bg-indigo-50 text-indigo-600",
    violet:
      "bg-violet-50 text-violet-600",
    cyan:
      "bg-cyan-50 text-cyan-600",
  }[accent];

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -8,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.4,
      }}
      whileHover={{
        x: 3,
      }}
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClasses}`}
        >
          <FileText className="h-4 w-4" />
        </div>

        <span className="truncate text-xs font-medium text-slate-700">
          {title}
        </span>
      </div>

      <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400 ring-1 ring-slate-100">
        {type}
      </span>
    </motion.div>
  );
}