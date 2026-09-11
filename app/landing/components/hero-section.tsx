"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const HERO_POINTS = [
  "Secure organization workspaces",
  "AI-powered knowledge retrieval",
  "Role-based access control",
];

export function HeroSection() {
  const shouldReduceMotion =
    useReducedMotion();

  return (
    <section className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, 24, 0],
                  y: [0, 18, 0],
                  scale: [1, 1.08, 1],
                }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[10%] top-16 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl"
        />

        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -20, 0],
                  y: [0, 22, 0],
                  scale: [1, 1.06, 1],
                }
          }
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[5%] top-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl"
        />

        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.11),transparent_65%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
            }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-indigo-700 shadow-sm shadow-indigo-100/60 backdrop-blur"
          >
            <motion.span
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: [0, 8, -8, 0],
                      scale: [1, 1.08, 1.08, 1],
                    }
              }
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50"
            >
              <Sparkles
                aria-hidden="true"
                className="h-3 w-3"
              />
            </motion.span>

            AI-powered enterprise knowledge
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
              duration: 0.7,
              ease: "easeOut",
            }}
            className="mt-7 text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl"
          >
            Make every document
            <motion.span
              initial={{
                opacity: 0,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
              }}
              transition={{
                delay: 0.3,
                duration: 0.8,
              }}
              className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent"
            >
              part of your knowledge.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.6,
            }}
            className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg"
          >
            A secure workspace for your organization&apos;s
            documents, knowledge and AI-powered answers —
            designed for teams that need information they
            can trust.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
              duration: 0.6,
            }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <motion.div
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <Link
                href="/register"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-shadow hover:shadow-xl hover:shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Start for free

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.55,
              duration: 0.6,
            }}
            className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-3"
          >
            {HERO_POINTS.map(
              (point, index) => (
                <motion.div
                  key={point}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      0.6 + index * 0.08,
                  }}
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-500"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-4 w-4 text-emerald-500"
                  />

                  {point}
                </motion.div>
              ),
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}