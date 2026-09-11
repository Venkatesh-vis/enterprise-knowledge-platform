"use client";

import Link from "next/link";
import { AnimatePresence, motion, } from "framer-motion";
import { ArrowRight, Menu, X, } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How it works",
    href: "#how-it-works",
  },
  {
    label: "Plans",
    href: "#pricing",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
];

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Enterprise Knowledge Platform home"
          onClick={() => setMobileOpen(false)}
          className="group flex cursor-pointer items-center gap-3"
        >
          <motion.span
            whileHover={{
              scale: 1.05,
              rotate: -2,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
            className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-black via-slate-900 to-slate-700 text-white shadow-lg shadow-slate-500/20"
          >
            <motion.span
              aria-hidden="true"
              animate={{
                x: ["-110%", "110%"],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatDelay: 2.5,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />

            <img
              src="/icon.svg"
              alt=""
              aria-hidden="true"
              className="relative h-[28px] w-[28px]"
            />
          </motion.span>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-tight text-slate-950">
              Enterprise Knowledge
            </p>

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
              Knowledge Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              whileHover={{
                y: -1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:inline-flex"
          >
            Sign in
          </Link>

          <motion.div
            whileHover={{
              y: -1,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <Link
              href="/register"
              className="group inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition-shadow hover:shadow-lg hover:shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Get started

              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <motion.button
            type="button"
            aria-label={
              mobileOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen(
                (current) => !current,
              )
            }
            whileTap={{
              scale: 0.94,
            }}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 md:hidden"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{
                    opacity: 0,
                    rotate: -90,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: 90,
                  }}
                >
                  <X
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{
                    opacity: 0,
                    rotate: 90,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: -90,
                  }}
                >
                  <Menu
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6"
            >
              {NAV_ITEMS.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                >
                  {item.label}
                </motion.a>
              ))}

              <Link
                href="/login"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition hover:shadow-md hover:shadow-indigo-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Get started

                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}