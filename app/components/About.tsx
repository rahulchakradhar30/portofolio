"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch('/api/admin/content');
        if (!res.ok) throw new Error('Failed to load about content');
        const data = await res.json();
        if (data.content) {
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
          className="text-center mb-16"
        >
          <h2 className="mb-6 bg-gradient-to-r from-[#0d1b2d] to-[#0e7490] bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            About Me
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
            <p className="text-lg leading-relaxed text-slate-600">
              {aboutData.aboutText}
            </p>
            <p className="text-lg leading-relaxed text-slate-600">
              My focus lies in AI, technology, and content creation. I excel in problem-solving and logical reasoning, and I&apos;m comfortable working across various fields - from software to hardware, irrespective of the domain. I prefer partnerships and entrepreneurship over traditional salaried jobs, seeking opportunities where I can generate revenue while doing what I love.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">AI Enthusiast</span>
              <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700">Tech Learner</span>
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">Content Creator</span>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Director</span>
              <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">Problem Solver</span>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Innovator</span>
            </div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 50 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, amount: 0.25 }}
            className="relative"
          >
            <div className="rounded-3xl bg-gradient-to-br from-cyan-100 to-emerald-100 p-8 shadow-2xl">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
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
                      <div className="text-3xl font-bold text-cyan-700 mb-2">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

