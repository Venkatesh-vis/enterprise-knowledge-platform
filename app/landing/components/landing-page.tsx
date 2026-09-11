"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";

import { CtaSection } from "./cta-section";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { ProductPreview } from "./product-preview";
import { WorkflowSection } from "./workflow-section";
import { FaqSection } from "./faq-section";
import { PricingSection } from "./pricing-section";

export function LandingPage() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.2,
  });

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-x-clip bg-[#f8faff] text-slate-950"
    >
      {/* Global reading progress */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400"
        style={{ scaleX }}
      />

      <LandingHeader />

      <HeroSection />

      <ProductPreview />

      <FeaturesSection />

      <WorkflowSection />

      <PricingSection />

      <FaqSection />

      <CtaSection />

      <LandingFooter />
    </main>
  );
}