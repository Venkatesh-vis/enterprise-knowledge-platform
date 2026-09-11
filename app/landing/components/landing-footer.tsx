"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const PRODUCT_LINKS = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How it works",
    href: "#how-it-works",
  },
];

const ACCOUNT_LINKS = [
  {
    label: "Sign in",
    href: "/login",
  },
  {
    label: "Create account",
    href: "/register",
  },
];

const TECH_STACK = [
  "Next.js",
  "TypeScript",
  "Auth.js",
  "Sequelize",
  "MySQL",
  "AWS S3",
  "AWS EC2",
  "GitHub Actions",
  "RAG",
];

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
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
          className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr]"
        >
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <motion.span
                whileHover={{
                  rotate: -3,
                  scale: 1.04,
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 text-white shadow-md shadow-indigo-500/15"
              >
                <BrainCircuit className="h-5 w-5" />
              </motion.span>

              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-950">
                  Enterprise Knowledge
                </p>

                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                  Knowledge Platform
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              A production-focused AI knowledge platform
              built to organize documents, secure
              organizational knowledge and make information
              easier to use.
            </p>

            <div className="mt-6 space-y-3">
              <ContactItem
                icon={MapPin}
                label="HYDERABAD, INDIA"
              />

              <ContactItem
                icon={Mail}
                label="venkateshvishwanadula257@gmail.com"
                href="mailto:venkateshvishwanadula257@gmail.com"
              />

              <ContactItem
                icon={Phone}
                label="+91 86884 22316"
                href="tel:+918688422316"
              />
            </div>
          </div>

          <FooterColumn
            title="Product"
            items={PRODUCT_LINKS}
          />

          <FooterColumn
            title="Account"
            items={ACCOUNT_LINKS}
          />

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Built with
            </h3>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Modern full-stack technologies focused on
              security, scalability and production engineering.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {TECH_STACK.map(
                (technology, index) => (
                  <motion.span
                    key={technology}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: index * 0.03,
                    }}
                    whileHover={{
                      y: -2,
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600"
                  >
                    {technology}
                  </motion.span>
                ),
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Enterprise
            Knowledge Platform. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Next.js</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>AI + RAG</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </h3>

      <nav className="mt-4 space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.href}
            whileHover={{
              x: 3,
            }}
          >
            <Link
              href={item.href}
              className="flex w-fit items-center gap-1 text-sm text-slate-500 transition-colors hover:text-indigo-600"
            >
              {item.label}

              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            </Link>
          </motion.div>
        ))}
      </nav>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  href?: string;
}) {
  const content = (
    <>
      <motion.span
        whileHover={{
          scale: 1.08,
        }}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
      >
        <Icon className="h-3.5 w-3.5" />
      </motion.span>

      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <motion.a
        whileHover={{
          x: 3,
        }}
        href={href}
        className="flex w-fit items-center gap-2.5 text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600"
      >
        {content}
      </motion.a>
    );
  }

  return (
    <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
      {content}
    </div>
  );
}