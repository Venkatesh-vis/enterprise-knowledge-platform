"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function CtaSection() {
  const shouldReduceMotion =
    useReducedMotion();

  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
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
          duration: 0.7,
        }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-slate-950 px-6 py-14 text-center text-white shadow-2xl shadow-indigo-950/20 sm:px-10 lg:py-16"
      >
        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, 30, 0],
                  y: [0, -18, 0],
                  scale: [1, 1.08, 1],
                }
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl"
        />

        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -25, 0],
                  y: [0, 15, 0],
                  scale: [1, 1.06, 1],
                }
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl"
        />

        <div className="relative">
          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -5, 0],
                  }
            }
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
          >
            <Sparkles className="h-5 w-5 text-indigo-200" />
          </motion.div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
            Start building
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Give your team a better way to use knowledge.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Start with the documents you already have and
            grow toward a secure, AI-powered enterprise
            knowledge platform.
          </p>

          <motion.div
            whileHover={{
              y: -2,
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="mt-8 inline-block"
          >
            <Link
              href="/register"
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-slate-950 shadow-lg transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Create your workspace

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}