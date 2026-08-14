"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../PortfolioContentProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { resolveLink } from "@/app/lib/urlPolicy";
import LoadingSkeleton from "../LoadingSkeleton";
import { Sparkles, ArrowRight, FileText, Globe, ExternalLink } from "lucide-react";

const DEFAULT_HERO_DATA = {
  heroTitle: "Rahul Chakradhar",
  heroSubtitle: "I build AI-powered digital systems that combine technology, storytelling, and real-world impact.",
  heroTagline: "Focused on scalable platforms, intelligent tools, and impactful digital experiences.",
  profileImage: "",
  bannerImage: "",
};

export default function HeroWall() {
  const { content, loading } = usePortfolioContent();

  const heroData = useMemo(() => {
    if (!content) return DEFAULT_HERO_DATA;
    return {
      heroTitle: content.heroTitle || DEFAULT_HERO_DATA.heroTitle,
      heroSubtitle: content.heroSubtitle || DEFAULT_HERO_DATA.heroSubtitle,
      heroTagline: content.heroTagline || DEFAULT_HERO_DATA.heroTagline,
      profileImage: content.profileImage || DEFAULT_HERO_DATA.profileImage,
      bannerImage: content.bannerImage || DEFAULT_HERO_DATA.bannerImage,
    };
  }, [content]);

  const resumeRes = useMemo(() => resolveLink(content?.resumeUrl), [content]);
  const githubRes = useMemo(() => resolveLink(content?.github, "github"), [content]);
  const linkedinRes = useMemo(() => resolveLink(content?.linkedin, "linkedin"), [content]);
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-6 sm:p-10 md:p-12 xl:p-16 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Architectural Canvas Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--accent)_0%,transparent_65%)] opacity-20 pointer-events-none" />

      {/* Decorative Wall Mounting Grid / Architectural Laser Guidelines */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px"
        }}
      />

      {/* Wall Corner Brackets */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[var(--accent)]/60 pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[var(--accent)]/60 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[var(--accent)]/60 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[var(--accent)]/60 pointer-events-none" />

      {/* Top Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            {siteCopy.heroBadge || "PORTFOLIO ROOM"}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
          WALL 01 // HERO STAGE
        </div>
      </div>

      {/* Main Wall Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {heroData.heroTitle}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-2xl font-medium text-white/85 max-w-2xl leading-relaxed"
          >
            {heroData.heroSubtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-white/60 max-w-xl leading-relaxed"
          >
            {heroData.heroTagline}
          </motion.p>

          {/* Wall Mounted Interactive Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-black bg-[var(--accent)] hover:bg-[var(--accent-strong)] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_var(--accent)] hover:scale-105 active:scale-95"
            >
              <span>{siteCopy.heroCTA1 || "Get In Touch"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {resumeRes.shouldDisplay && resumeRes.url && (
              <a
                href={resumeRes.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 transition-all backdrop-blur-md hover:scale-105"
              >
                <FileText className="w-4 h-4 text-[var(--accent)]" />
                <span>{siteCopy.heroCTA2 || "Resume"}</span>
              </a>
            )}

            {githubRes.shouldDisplay && githubRes.url && (
              <a
                href={githubRes.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all backdrop-blur-md hover:scale-105 flex items-center gap-2 font-mono text-xs"
              >
                <Globe className="w-4 h-4 text-[var(--accent)]" />
                <span>GITHUB</span>
              </a>
            )}

            {linkedinRes.shouldDisplay && linkedinRes.url && (
              <a
                href={linkedinRes.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all backdrop-blur-md hover:scale-105 flex items-center gap-2 font-mono text-xs"
              >
                <ExternalLink className="w-4 h-4 text-[var(--accent)]" />
                <span>LINKEDIN</span>
              </a>
            )}
          </motion.div>
        </div>

        {/* Right Column: Profile Avatar Mounted in Architectural Frame */}
        {heroData.profileImage && (
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl p-2 bg-gradient-to-br from-white/20 via-white/5 to-[var(--accent)]/30 border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#121520]">
                <Image
                  src={heroData.profileImage}
                  alt={heroData.heroTitle}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom Wall Status Bar */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>PHASE 1 // ROOM FOUNDATION</div>
        <div className="hidden sm:block">EYE-LEVEL CAMERA VIEWPOINT</div>
      </div>
    </div>
  );
}
