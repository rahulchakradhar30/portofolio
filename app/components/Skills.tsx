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
import { Sparkles } from "lucide-react";

const SKILL_TAG_PRESETS: Record<string, string[]> = {
  python: ["AI", "Backend", "Automation"],
  "next.js": ["App Router", "Frontend", "Performance"],
  react: ["UI", "Components", "State"],
  typescript: ["Reliability", "Scale", "Frontend"],
  javascript: ["Web", "Interaction", "Product UI"],
  firebase: ["Auth", "Database", "Cloud"],
  openai: ["LLMs", "Automation", "AI"],
  figma: ["Design", "Prototyping", "Systems"],
  node: ["APIs", "Backend", "Automation"],
  default: ["Applied", "System", "Production"],
};

function getSkillTags(skill: Skill) {
  const key = skill.title.toLowerCase();
  return SKILL_TAG_PRESETS[key] || SKILL_TAG_PRESETS.default;
}

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
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Capability grid
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-cyan-100 via-white to-indigo-200 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            {siteCopy.skillsHeading}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm leading-relaxed text-slate-300 sm:text-base md:text-xl">
            {siteCopy.skillsSubtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-cyan-300 to-indigo-300 md:mt-6 md:w-24" />
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={12} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 lg:gap-8">
            {visibleSkills.length === 0 ? (
              <div className="col-span-full text-center text-slate-400">{siteCopy.skillsEmpty}</div>
            ) : (
              visibleSkills.map((skill, index) => (
                <motion.div
                  key={skill.id || index}
                  initial={reducedMotion ? false : { opacity: 0, y: 40 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={reducedMotion ? undefined : { duration: 0.55, delay: index * 0.08 }}
                  whileHover={reducedMotion ? undefined : { y: -10, scale: 1.02 }}
                  viewport={{ once: true, amount: 0.25 }}
                  className="premium-card rounded-[1.75rem] p-5 text-white transition-all duration-300 hover:border-cyan-300/30 md:p-8"
                >
                  <div className="mb-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(34,211,238,0.22)_0%,rgba(99,102,241,0.22)_100%)] shadow-lg md:mb-6 md:h-16 md:w-16">
                    {resolveSkillIconUrl(skill.icon) ? (
                      <div
                        role="img"
                        aria-label={skill.title}
                        className="h-8 w-8 bg-contain bg-center bg-no-repeat md:h-10 md:w-10"
                        style={{ backgroundImage: `url(${resolveSkillIconUrl(skill.icon)})` }}
                      />
                    ) : (
                      <span className="text-xl md:text-2xl">S</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white md:text-2xl">{skill.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-300 md:text-base">{skill.description}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 md:mt-6">
                    {getSkillTags(skill).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                        {tag}
                      </span>
                    ))}
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
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              {siteCopy.skillsViewMore}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}