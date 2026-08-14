"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../../PortfolioContentProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { User, Award, CheckCircle, Sparkles } from "lucide-react";

export default function AboutWall() {
  const { content } = usePortfolioContent();
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const stats = content?.aboutStats || [
    { label: "AI Models Built", value: "10+" },
    { label: "Full Stack Apps", value: "15+" },
    { label: "Certifications", value: "8+" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Wall Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>EXHIBIT 02</span>
          </span>
          <span className="text-xs font-mono text-white/40">// BACKGROUND & PROFILE</span>
        </div>
        <div className="text-xs font-mono text-white/40">BIOGRAPHY PANEL</div>
      </div>

      {/* Center Exhibition Body */}
      <div className="my-auto space-y-8 max-w-4xl">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-2">
            {siteCopy.aboutBadge || "ABOUT ME"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            {siteCopy.aboutHeading || "ENGINEERING ARTIFICIAL INTELLIGENCE & HIGH-PERFORMANCE WEB APPLICATION"}
          </h2>
        </div>

        {/* Bio Copy */}
        <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed font-sans">
          <p>{content?.aboutText || siteCopy.aboutBody1}</p>
          {siteCopy.aboutBody2 && <p className="text-white/60">{siteCopy.aboutBody2}</p>}
        </div>

        {/* Real Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[var(--accent)]/50 transition-colors"
            >
              <div className="text-2xl sm:text-4xl font-black font-mono text-[var(--accent)]">
                {stat.value}
              </div>
              <div className="text-xs font-mono text-white/60 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>VERIFIED CMS PROFILE</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>EXHIBIT PANEL 02</span>
        </div>
      </div>
    </div>
  );
}
