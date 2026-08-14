"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Sparkles, Cpu } from "lucide-react";

export default function ProofWall() {
  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EXHIBIT 09</span>
          </span>
          <span className="text-xs font-mono text-white/40">// PROOF MODE</span>
        </div>
        <div className="text-xs font-mono text-white/40">SYSTEM EVIDENCE</div>
      </div>

      {/* Body */}
      <div className="my-auto space-y-6 max-w-4xl">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-1">
            INTERACTIVE SYSTEM ARCHITECTURE EVIDENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            PROOF MODE INSTALLATION
          </h2>
        </div>

        <p className="text-sm sm:text-base text-white/80 font-sans leading-relaxed">
          Proof Mode provides deep interactive architectural visualizers, before-and-after benchmark metrics, decision simulations, and technical evidence links for key engineering projects.
        </p>

        <div className="pt-4">
          <Link
            href="/proof-mode"
            className="px-6 py-3.5 rounded-xl bg-[var(--accent)] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ENTER DEDICATED PROOF MODE ENVIRONMENT</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>VERIFIED SYSTEM PROOF EVIDENCE</span>
        </div>
        <div>EXHIBIT PANEL 09</div>
      </div>
    </div>
  );
}
