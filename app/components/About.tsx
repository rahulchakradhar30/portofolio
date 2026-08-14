"use client";

import { useMemo } from "react";
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
  const { content, loading, error: _error } = usePortfolioContent();
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

  if (loading) {
    return (
      <section className="relative px-4 py-24 sm:px-6 lg:px-10">
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
    <section className="relative px-4 py-24 sm:px-6 lg:py-32 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16 text-center"
        >
          <div className="paper-chip mx-auto mb-6 inline-flex uppercase tracking-[0.24em]">
            {siteCopy.aboutBadge}
          </div>
          <h2 id="about-heading" className="mb-6 text-4xl font-black md:text-6xl tracking-tighter text-[var(--foreground)]">
            {siteCopy.aboutHeading}
          </h2>
          <div className="mx-auto h-1 w-24 bg-[var(--foreground)] editorial-border rounded-full" />
        </motion.div>

        <ExpandableSection collapsedMaxHeightPx={850}>
          <div className="grid items-start gap-12 md:grid-cols-2 lg:gap-20">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, x: -30 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.1, ease: [0.42, 0, 0.58, 1] }}
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-6"
            >
              {storyBlocks.map((block, idx) => {
                const Icon = block.icon;
                return (
                  <motion.div
                    key={block.label}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={reducedMotion ? undefined : { duration: 0.6, delay: idx * 0.1, ease: [0.42, 0, 0.58, 1] }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="paper-card glass-surface p-6 sm:p-8"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                      <Icon className="h-5 w-5" />
                      {block.label}
                    </div>
                    <h3 className="mt-4 text-3xl font-black tracking-tight">{block.title}</h3>
                    <p className="mt-4 text-lg leading-relaxed font-medium">{block.copy}</p>
                  </motion.div>
                );
              })}

              <div className="grid gap-3 sm:grid-cols-2 pt-4">
                {siteCopy.aboutTags.map((tag) => (
                  <span
                    key={tag}
                    className="paper-chip text-center cursor-default py-3 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, x: 30 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.2, ease: [0.42, 0, 0.58, 1] }}
              viewport={{ once: true, amount: 0.2 }}
              className="relative"
            >
              <div className="paper-card glass-surface p-8 sm:p-10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  <Layers3 className="h-5 w-5" />
                  Proof points
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
                  {aboutData.aboutStats.slice(0, 4).map((stat, index) => (
                    <motion.div
                      key={`${stat.label}-${index}`}
                      className="rounded-3xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] p-6 text-center transition-all duration-300 hover:bg-[var(--surface-strong)] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(42,36,31,0.15)]"
                      initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
                      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                      transition={reducedMotion ? undefined : { duration: 0.5, delay: index * 0.1, ease: [0.42, 0, 0.58, 1] }}
                      viewport={{ once: true, amount: 0.2 }}
                    >
                      <div className="text-4xl font-black tracking-tighter text-[var(--foreground)]">{stat.value}</div>
                      <div className="mt-2 text-sm font-bold uppercase tracking-wide">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface-strong)] p-6 text-base font-bold leading-relaxed text-[var(--foreground)] shadow-[2px_2px_0_0_rgba(42,36,31,0.1)]">
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

