"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../../PortfolioContentProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { ArrowRight, Sparkles, Send, FileText, Code, Cpu } from "lucide-react";

export default function HeroWall() {
  const { content } = usePortfolioContent();
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const name = content?.heroTitle || siteCopy.headerBrand || "RAHUL CHAKRADHAR";
  const role = content?.heroSubtitle || "AI/ML Engineer & Full Stack Developer";
  const tagline = content?.heroTagline || "BUILDING INTELLIGENT SYSTEMS & DIGITALLY IMMERSIVE EXPERIENCES";

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Top Identity Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>EXHIBIT 01</span>
          </span>
          <span className="text-xs font-mono text-white/40">// PERSONAL IDENTITY</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-white/40">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="hidden sm:inline">PORTFOLIO ENTRY</span>
        </div>
      </div>

      {/* Center Exhibition Typography */}
      <div className="my-auto space-y-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-xs font-mono text-white/80"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span>{siteCopy.heroBadge || "AVAILABLE FOR AI & FULL STACK ROLES"}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60"
        >
          {name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-2xl font-mono text-[var(--accent)] font-semibold"
        >
          {role}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-sm sm:text-lg text-white/70 max-w-2xl font-sans leading-relaxed"
        >
          {tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap items-center gap-4 pt-4"
        >
          <a
            href="#projects"
            className="px-6 py-3.5 rounded-xl bg-[var(--accent)] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>{siteCopy.heroCTA1 || "EXPLORE PORTFOLIO"}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#contact"
            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-[var(--accent)]" />
            <span>{siteCopy.heroCTA2 || "GET IN TOUCH"}</span>
          </a>

          {content?.resumeUrl && (
            <a
              href={content.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>RESUME</span>
            </a>
          )}
        </motion.div>
      </div>

      {/* Bottom Exhibition Metadata */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-4">
          <span>LOCATION: {content?.location || "India"}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">EMAIL: {content?.email}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--accent)] font-bold">
          <Code className="w-3.5 h-3.5" />
          <span>PORTFOLIO EXHIBITION</span>
        </div>
      </div>
    </div>
  );
}
