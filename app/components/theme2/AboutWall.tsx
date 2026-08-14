"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../PortfolioContentProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import LoadingSkeleton from "../LoadingSkeleton";
import { User, Sparkles, Award, CheckCircle2 } from "lucide-react";

export default function AboutWall() {
  const { content, loading } = usePortfolioContent();
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const aboutData = useMemo(() => {
    return {
      heading: content?.aboutHeading || siteCopy.aboutHeading || "About Me",
      shortTitle: content?.aboutShortTitle || "AI/ML Student & Full Stack Engineer",
      shortCopy: content?.aboutShortCopy || content?.aboutBody1 || "I design and build intelligent web applications, AI models, and scalable digital solutions.",
      body: content?.aboutBody2 || content?.aboutBody1 || "",
      tags: content?.aboutTags && content.aboutTags.length > 0 ? content.aboutTags : ["AI Systems", "Full Stack", "React", "Next.js", "Python", "Machine Learning"],
      footer: content?.aboutFooter || "Building technology with purpose, clarity, and real-world impact.",
    };
  }, [content, siteCopy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSkeleton variant="about" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-6 sm:p-10 md:p-12 xl:p-16 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--accent)_0%,transparent_60%)] opacity-15 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <User className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            {siteCopy.aboutBadge || "EXHIBIT // ABOUT"}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          WALL 02 // ARCHITECTURE
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column: Heading & Key Copy */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {aboutData.heading}
            </h2>
            <p className="mt-2 text-lg sm:text-2xl font-semibold text-[var(--accent)]">
              {aboutData.shortTitle}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-lg text-white/85 leading-relaxed max-w-xl"
          >
            {aboutData.shortCopy}
          </motion.p>

          {aboutData.body ? (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-xl"
            >
              {aboutData.body}
            </motion.p>
          ) : null}

          {/* Core Capability Tags */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-2 pt-2"
          >
            {aboutData.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white/90 bg-white/10 border border-white/15 backdrop-blur-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Statement Card */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-white/15 via-white/5 to-[var(--accent)]/20 border border-white/20 backdrop-blur-xl shadow-2xl space-y-4 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold text-white">Philosophy & Focus</h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {aboutData.footer}
            </p>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
              <span>STATUS: ACTIVE DEVELOPER</span>
              <Award className="w-4 h-4 text-[var(--accent)]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>ABOUT EXHIBIT</div>
        <div className="hidden sm:block">REAL ADMIN DATA</div>
      </div>
    </div>
  );
}
