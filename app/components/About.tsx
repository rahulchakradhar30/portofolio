"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

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

  return (
    <section className="section-surface relative px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300"></div>

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
            {siteCopy.aboutBadge}
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-cyan-100 via-emerald-100 to-amber-100 bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            {siteCopy.aboutHeading}
          </h2>
          <div className="mx-auto h-1 w-24 bg-gradient-to-r from-amber-300 to-cyan-300"></div>
        </motion.div>

        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -50 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.25 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-cyan-300/15 bg-slate-950/65 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-6 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80">A short version</p>
              <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
                {siteCopy.aboutShortCopy}
              </p>
            </div>
            <p className="text-lg leading-relaxed text-slate-300">
              {aboutData.aboutText}
            </p>
            <p className="text-lg leading-relaxed text-slate-300">
              {siteCopy.aboutBody2}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {siteCopy.aboutTags.map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">{tag}</span>
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
            <div className="rounded-3xl bg-gradient-to-br from-cyan-100 to-emerald-100 p-6 shadow-2xl sm:p-8">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-6 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-6">
                  {aboutData.aboutStats.slice(0, 4).map((stat, index) => (
                    <motion.div
                      key={`${stat.label}-${index}`}
                      className="text-center"
                      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={reducedMotion ? undefined : { duration: 0.4, delay: index * 0.08 }}
                      viewport={{ once: true, amount: 0.35 }}
                    >
                      <div className="text-3xl font-bold text-cyan-200 mb-2">{stat.value}</div>
                      <div className="text-sm text-slate-300">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-950/80 p-4 text-sm text-cyan-50 backdrop-blur-xl">
                {siteCopy.aboutFooter}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

