"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "What is the Enterprise Knowledge Platform?",
    answer:
      "It is a centralized workspace for managing organizational documents and knowledge, with secure access controls and an AI assistant that helps teams find and understand information.",
  },
  {
    question:
      "How does company registration, user access, and role management work?",
    answer:
      "A company starts by registering an organization and creating its first account. The person who creates the organization becomes its initial Owner and receives administrative control over the workspace. The Owner or an authorized Administrator can then invite employees to join the organization. Invited users access the platform through their own accounts rather than sharing company credentials. Once a user joins, an Owner or Administrator assigns an appropriate role, such as Admin, Manager, or Member. Roles determine which permissions and actions the user can perform, while more specific resource-level permissions can further restrict access to documents and knowledge. Every access decision is evaluated within the user's organization, maintaining tenant isolation and preventing users from accessing another organization's data.",
  },
  {
    question: "How does the AI assistant work?",
    answer:
      "The assistant retrieves relevant information from your organization's authorized knowledge sources and uses that context to generate answers. Access permissions are enforced so users only receive information they are allowed to access.",
  },
  {
    question: "Is AI usage included in the subscription?",
    answer:
      "The platform subscription covers the features included in your selected plan. AI usage is metered separately based on actual usage, allowing costs to reflect the models and processing your organization consumes.",
  },
  {
    question:
      "How do roles, permissions, and access controls work?",
    answer:
      "Organizations control access through role-based permissions and document-level access controls. Administrators can assign roles and determine which capabilities users can access, while document permissions can further restrict individual knowledge resources. Access is evaluated within the user's organization, helping maintain tenant isolation and preventing users from accessing information outside their authorized scope. The platform also provides administrative controls and audit logs to help organizations understand and manage access.",
  },
  {
    question: "How is my organization's data isolated?",
    answer:
      "Organizations are treated as separate tenants, and authorization checks are applied to data access. Production storage and application architecture are designed around tenant isolation and least-privilege access.",
  },
  {
    question: "Can we change our plan later?",
    answer:
      "Yes. Subscription changes are handled through the billing lifecycle, with the applicable plan and billing-period rules determining how the change is applied.",
  },
  {
    question: "What happens if AI usage becomes expensive?",
    answer:
      "AI usage is metered and aggregated separately from the platform fee. Spending limits and usage alerts can be used to provide visibility and control over AI consumption.",
  },
  {
    question: "Do you store credit card information?",
    answer:
      "No. Payment credentials are handled by the payment provider. The application stores payment-provider references and auditable billing records rather than raw card data.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(
    null,
  );

  function toggleFaq(index: number) {
    setOpenIndex((current) =>
      current === index ? null : index,
    );
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-slate-200/70 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            FAQ
          </p>

          <h2
            id="faq-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
          >
            Questions, answered.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500">
            Everything you need to know about the platform,
            security, AI usage, and billing.
          </p>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={faq.question}
                className="border-b border-slate-200 last:border-b-0"
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="group flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-6 px-5 py-5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500/40 sm:px-6"
                >
                  <span className="text-sm font-semibold leading-6 text-slate-900 sm:text-base">
                    {faq.question}
                  </span>

                  <motion.span
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors group-hover:border-slate-300 group-hover:text-slate-600"
                  >
                    <ChevronDown
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={contentId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.25,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 pr-14 text-sm leading-6 text-slate-500 sm:px-6 sm:pr-16">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}