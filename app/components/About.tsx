"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { BadgeCheck, Compass, Layers3, Sparkles } from "lucide-react";

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
  const { reducedMotion } = useMotionPreferences();
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT);
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch('/api/admin/content');
        if (!res.ok) throw new Error('Failed to load about content');
        const data = await res.json();
        if (data.content) {
          setSiteCopy(getSiteCopy(data.content));
          setAboutData({
            aboutText: data.content.aboutText || DEFAULT_ABOUT.aboutText,
            aboutStats:
              Array.isArray(data.content.aboutStats) && data.content.aboutStats.length > 0
                ? data.content.aboutStats
                : DEFAULT_ABOUT.aboutStats,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load about section'));
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  if (error) throw error;
  if (loading) {
    return (
      <section className="section-surface relative px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <LoadingSkeleton variant="about" />
      </section>
    );
  }

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
    <section className="section-surface relative px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-cyan-300 via-white/30 to-indigo-300" />

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100 shadow-sm">
            {siteCopy.aboutBadge}
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-cyan-100 via-white to-indigo-200 bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            {siteCopy.aboutHeading}
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-cyan-300 to-indigo-300" />
        </motion.div>

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
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                    <Icon className="h-4 w-4" />
                    {block.label}
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-white">{block.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-300 sm:text-lg">{block.copy}</p>
                </div>
              );
            })}

            <div className="grid gap-3 sm:grid-cols-2">
              {siteCopy.aboutTags.map((tag) => (
                <span key={tag} className="premium-chip rounded-full px-4 py-2 text-sm font-medium text-cyan-50">
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
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                <Layers3 className="h-4 w-4" />
                Proof points
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                {aboutData.aboutStats.slice(0, 4).map((stat, index) => (
                  <motion.div
                    key={`${stat.label}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={reducedMotion ? undefined : { duration: 0.4, delay: index * 0.08 }}
                    viewport={{ once: true, amount: 0.35 }}
                  >
                    <div className="text-3xl font-black text-white">{stat.value}</div>
                    <div className="mt-2 text-sm text-slate-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b0f19]/80 p-4 text-sm leading-relaxed text-slate-300">
                {siteCopy.aboutFooter}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

