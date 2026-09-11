"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isRegister = pathname === "/register";

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* =========================
            LEFT — BRAND PANEL
        ========================== */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          {/* Decorative elements */}
          <div
            aria-hidden="true"
            className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
          />

          {/* Brand content */}
          <div className="relative z-10 flex w-full items-center px-12 xl:px-20">
            <div className="w-full max-w-xl">        
              {/* Animated content */}
              <div className="relative mt-10 min-h-[230px]">
                <AnimatePresence mode="wait" initial={false}>
                  {isRegister ? (
                    <motion.div
                      key="register-brand"
                      initial={{
                        opacity: 0,
                        x: -60,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 60,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute inset-x-0 top-0"
                    >
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
                        Enterprise Knowledge
                      </p>

                      <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                        Build your organization&apos;s knowledge system.
                      </h2>

                      <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                        Centralize documents, knowledge, permissions and
                        AI-powered answers in one secure workspace.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="login-brand"
                      initial={{
                        opacity: 0,
                        x: 60,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -60,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute inset-x-0 top-0"
                    >
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
                        Enterprise Knowledge
                      </p>

                      <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                        Your organization&apos;s knowledge, connected.
                      </h2>

                      <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                        Securely manage enterprise knowledge and help your
                        teams find the information they need.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom message */}
              <div className="mt-10 flex items-center gap-3 text-sm text-slate-400">
                <div className="h-px w-8 bg-slate-700" />

                <span>Secure. Collaborative. AI-powered.</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            RIGHT — AUTH FORM
        ========================== */}
        <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
          <div className="w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{
                  opacity: 0,
                  x: isRegister ? 50 : -50,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: isRegister ? -50 : 50,
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}