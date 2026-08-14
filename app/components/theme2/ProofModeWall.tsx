"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, FileCheck } from "lucide-react";

export default function ProofModeWall() {
  return (
    <div className="relative w-full h-full p-6 sm:p-10 md:p-12 xl:p-16 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent)_0%,transparent_60%)] opacity-20 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // PROOF MODE
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          TECHNICAL EVIDENCE SYSTEM
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto space-y-6 text-center my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex p-4 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]"
        >
          <FileCheck className="w-10 h-10" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
        >
          Interactive Proof Mode
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto"
        >
          Inspect verifiable evidence, architecture diagrams, decision simulations, and live system metrics behind every project and engineering claim.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-2"
        >
          <Link
            href="/proof-mode"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-black bg-[var(--accent)] hover:bg-[var(--accent-strong)] transition-all shadow-[0_0_25px_var(--accent)] hover:scale-105 active:scale-95"
          >
            <span>Explore Technical Evidence</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>PROOF MODE EXHIBIT</div>
        <div className="hidden sm:block">VERIFIABLE TECHNICAL PROOF</div>
      </div>
    </div>
  );
}
