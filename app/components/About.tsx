"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton";
import ExpandableSection from "./ExpandableSection";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { BadgeCheck, Compass, Layers3, Sparkles } from "lucide-react";
import { usePortfolioContent } from "./PortfolioContentProvider";

const DEFAULT_ABOUT = {
  aboutText:
    "I am a passionate AI enthusiast, tech learner, content creator, and director who builds innovative solutions for real-world impact.",
  aboutStats: [
    { label: "Major Projects", value: "3+" },
    { label: "Certifications", value: "5+" },
    { label: "Websites Published", value: "2+" },
    { label: "Success Rate", value: "90%" },
  ],
};

export default function About() {
  const { content, loading, error } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();

  const aboutData = useMemo(() => {
    if (!content) return DEFAULT_ABOUT;
    return {
      aboutText: content.aboutText || DEFAULT_ABOUT.aboutText,
      aboutStats:
        Array.isArray(content.aboutStats) && content.aboutStats.length > 0
          ? content.aboutStats
          : DEFAULT_ABOUT.aboutStats,
    };
  }, [content]);

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);
  const isVisible = content ? content.sectionVisibility?.about !== false : true;

  if (error) throw error;
  if (loading) {
    return (
      <section className="section-surface relative min-h-screen px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <LoadingSkeleton variant="about" />
      </section>
    );
  }
  if (!isVisible) return null;

  const storyBlocks = [
    {
      label: "Identity",
      title: siteCopy.aboutShortTitle,
      copy: siteCopy.aboutShortCopy,
      icon: Sparkles,
    },
    {
      label: "Capability",
      title: "What I build",
      copy: aboutData.aboutText,
      icon: BadgeCheck,
    },
    {
      label: "Direction",
      title: "Where I’m headed",
      copy: siteCopy.aboutBody2,
      icon: Compass,
    },
  ];

  return (
    <section className="section-surface relative min-h-screen px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-[#8d6b4e] via-white/50 to-[#c4a884]" />

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex rounded-full border border-[#7a5f47]/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a5f47] shadow-sm">
            {siteCopy.aboutBadge}
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-[#7a5f47] via-[#b6926d] to-[#9b7a5b] bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            {siteCopy.aboutHeading}
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-[#8d6b4e] to-[#c4a884]" />
        </motion.div>

        <ExpandableSection collapsedMaxHeightPx={760}>
          <div className="grid items-start gap-10 md:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -50 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.25 }}
            className="space-y-4"
          >
            {storyBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <div key={block.label} className="premium-card rounded-3xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d6b4e]">
                    <Icon className="h-4 w-4" />
                    {block.label}
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-[#2f241b]">{block.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-[#6a5846] sm:text-lg">{block.copy}</p>
                </div>
              );
            })}

            <div className="grid gap-3 sm:grid-cols-2">
              {siteCopy.aboutTags.map((tag) => (
                <span key={tag} className="premium-chip rounded-full px-4 py-2 text-sm font-medium text-[#6a5846]">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 50 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, amount: 0.25 }}
            className="relative"
          >
            <div className="premium-card rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8d6b4e]">
                <Layers3 className="h-4 w-4" />
                Proof points
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                {aboutData.aboutStats.slice(0, 4).map((stat, index) => (
                  <motion.div
                    key={`${stat.label}-${index}`}
                    className="rounded-2xl border border-[#7a5f47]/10 bg-white p-4 text-center"
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={reducedMotion ? undefined : { duration: 0.4, delay: index * 0.08 }}
                    viewport={{ once: true, amount: 0.35 }}
                  >
                    <div className="text-3xl font-black text-[#2f241b]">{stat.value}</div>
                    <div className="mt-2 text-sm text-[#6a5846]">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-[#7a5f47]/10 bg-[#f8f1e7] p-4 text-sm leading-relaxed text-[#6a5846]">
                {siteCopy.aboutFooter}
              </div>
            </div>
          </motion.div>
          </div>
        </ExpandableSection>
      </div>
    </section>
  );
}

