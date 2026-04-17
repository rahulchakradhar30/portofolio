"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Skill } from "@/app/lib/types";
import { resolveSkillIconUrl } from "@/app/lib/skillLogoCatalog";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

export default function Skills() {
  const { reducedMotion } = useMotionPreferences();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const [skillsRes, contentRes] = await Promise.all([
          fetch('/api/admin/skills'),
          fetch('/api/admin/content'),
        ]);
        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setSkills(data.skills || []);
        } else {
          throw new Error('Failed to fetch skills');
        }

        if (contentRes.ok) {
          const data = await contentRes.json();
          if (data.content) {
            setSiteCopy(getSiteCopy(data.content));
          }
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        setError(error instanceof Error ? error : new Error('Failed to load skills'));
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (error) throw error;

  const orderedSkills = prioritizeFeatured(skills);
  const visibleSkills = orderedSkills.slice(0, 12);
  const hasMore = orderedSkills.length > visibleSkills.length;

  return (
    <section className="section-soft relative overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-3 md:opacity-5">
        <div className="absolute top-5 md:top-10 left-5 md:left-10 w-16 md:w-20 h-16 md:h-20 border border-violet-300 rounded-full"></div>
        <div className="absolute top-24 md:top-40 right-5 md:right-20 w-12 md:w-16 h-12 md:h-16 border border-pink-300 rounded-full"></div>
        <div className="absolute bottom-10 md:bottom-20 left-1/4 w-16 md:w-24 h-16 md:h-24 border border-green-300 rounded-full"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="mb-4 bg-gradient-to-r from-cyan-100 via-emerald-100 to-amber-100 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            {siteCopy.skillsHeading}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm text-slate-300 sm:text-base md:text-xl">
            {siteCopy.skillsSubtitle}
          </p>
          <div className="mx-auto mt-4 h-1 w-16 bg-gradient-to-r from-amber-300 to-cyan-300 md:mt-6 md:w-24"></div>
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={12} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 lg:gap-8">
            {visibleSkills.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No skills found.</div>
            ) : (
              visibleSkills.map((skill, index) => (
                <motion.div
                  key={skill.id || index}
                  initial={reducedMotion ? false : { opacity: 0, y: 40 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={reducedMotion ? undefined : { duration: 0.55, delay: index * 0.08 }}
                  whileHover={reducedMotion ? undefined : { y: -10, scale: 1.02 }}
                  viewport={{ once: true, amount: 0.25 }}
                  className="rounded-2xl border border-cyan-300/15 bg-slate-950/60 p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-300/35 hover:shadow-[0_20px_60px_rgba(0,0,0,0.42)] md:rounded-3xl md:p-8"
                >
                  <div className="mb-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg md:mb-6 md:h-16 md:w-16 md:rounded-2xl">
                    {resolveSkillIconUrl(skill.icon) ? (
                      <div
                        role="img"
                        aria-label={skill.title}
                        className="h-8 w-8 bg-contain bg-center bg-no-repeat md:h-10 md:w-10"
                        style={{ backgroundImage: `url(${resolveSkillIconUrl(skill.icon)})` }}
                      />
                    ) : (
                      <span className="text-xl md:text-2xl">🛠️</span>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white md:mb-3 md:text-2xl">{skill.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300 md:text-base">{skill.description}</p>

                  {/* Progress bar */}
                  <div className="mt-4 md:mt-6">
                    <div className="h-2 w-full rounded-full bg-slate-800">
                      <motion.div
                        initial={reducedMotion ? false : { width: 0 }}
                        whileInView={reducedMotion ? undefined : { width: `${skill.proficiency || 80}%` }}
                        transition={reducedMotion ? undefined : { duration: 0.9, delay: index * 0.08 + 0.25 }}
                        style={reducedMotion ? { width: `${skill.proficiency || 80}%` } : undefined}
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      ></motion.div>
                    </div>
                    <div className="mt-1 text-right text-xs text-slate-400 md:text-sm">{skill.proficiency || 80}%</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {!loading && hasMore ? (
          <div className="mt-10 text-center">
            <Link
              href="/skills"
              className="inline-flex items-center rounded-full border border-cyan-300/20 bg-white/5 px-6 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-white/10"
            >
              {siteCopy.skillsViewMore}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}