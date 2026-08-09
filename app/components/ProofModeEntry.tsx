"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Activity, Cpu } from "lucide-react";
import { useMotionPreferences } from "./MotionProvider";

export default function ProofModeEntry() {
  const { reducedMotion } = useMotionPreferences();

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-10 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="paper-card relative overflow-hidden bg-[var(--surface-strong)] p-8 sm:p-12 lg:p-16 border-2 border-[var(--foreground)] shadow-[10px_10px_0_0_rgba(42,36,31,0.2)]"
        >
          {/* Subtle background paper pattern accent */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div>
              <div className="paper-chip inline-flex items-center gap-2 uppercase tracking-[0.24em] font-mono text-xs bg-[var(--surface)] text-[var(--accent)] border-[var(--foreground)] mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Interactive Capability Engine
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--foreground)] tracking-tighter leading-tight">
                PROOF MODE
              </h2>

              <p className="mt-4 text-xl sm:text-2xl font-bold text-[var(--foreground)]/90 tracking-tight leading-snug">
                &ldquo;Don&apos;t just read about what I build. <br className="hidden sm:inline" />
                Experience it.&rdquo;
              </p>

              <p className="mt-4 text-base sm:text-lg text-[var(--foreground)]/75 max-w-2xl leading-relaxed">
                Step inside an interactive evidence environment. Explore architectural breakdowns, 
                system flows, strategic decisions, and live demonstrations backed by real portfolio projects.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/proof-mode"
                  className="paper-button-primary group inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-extrabold tracking-tight"
                >
                  <span>[ ENTER PROOF MODE ]</span>
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>

            {/* Visual Evidence Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="paper-card p-5 bg-[var(--surface)] border border-[var(--foreground)]/20 shadow-[4px_4px_0_0_rgba(42,36,31,0.1)]">
                <div className="flex items-center gap-3 mb-2">
                  <Cpu className="h-5 w-5 text-[var(--accent)]" />
                  <span className="font-extrabold text-sm text-[var(--foreground)]">Architectures</span>
                </div>
                <p className="text-xs text-[var(--foreground)]/70 leading-relaxed">
                  Interactive node visualizers & system pipelines.
                </p>
              </div>

              <div className="paper-card p-5 bg-[var(--surface)] border border-[var(--foreground)]/20 shadow-[4px_4px_0_0_rgba(42,36,31,0.1)]">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-[var(--accent)]" />
                  <span className="font-extrabold text-sm text-[var(--foreground)]">Real Outcomes</span>
                </div>
                <p className="text-xs text-[var(--foreground)]/70 leading-relaxed">
                  Before vs after benchmarks & quantified metrics.
                </p>
              </div>

              <div className="paper-card sm:col-span-2 p-5 bg-[var(--surface)] border border-[var(--foreground)]/20 shadow-[4px_4px_0_0_rgba(42,36,31,0.1)] flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-[var(--foreground)] block">
                    Zero Mock Content Guarantee
                  </span>
                  <span className="text-xs text-[var(--foreground)]/70">
                    Driven 100% by published admin project evidence.
                  </span>
                </div>
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 ml-3" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
