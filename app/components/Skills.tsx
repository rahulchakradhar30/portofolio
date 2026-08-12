"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Skill } from "@/app/lib/types";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import LoadingSkeleton from "./LoadingSkeleton";
import ExpandableSection from "./ExpandableSection";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { Sparkles } from "lucide-react";
import { usePortfolioContent } from "./PortfolioContentProvider";

import SkillIcon from "./SkillIcon";

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
  const { content, loading: contentLoading, error: _contentError } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<Error | null>(null);

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);
  const isVisible = content ? content.sectionVisibility?.skills !== false : true;

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsRes = await fetch('/api/admin/skills');
        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setSkills(data.skills || []);
        } else {
          throw new Error('Failed to fetch skills');
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError(err instanceof Error ? err : new Error('Failed to load skills'));
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if ((loading || contentLoading) && isVisible) {
    return (
      <section className="relative px-4 py-24 sm:px-6 lg:px-10">
        <LoadingSkeleton variant="cards" />
      </section>
    );
  }
  if (!isVisible) return null;

  const orderedSkills = prioritizeFeatured(skills);
  const visibleSkills = orderedSkills.slice(0, 12);

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:py-32 lg:px-10">
      <div className="relative z-10 mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16 text-center"
        >
          <div className="paper-chip mx-auto mb-6 inline-flex uppercase tracking-[0.24em] gap-2">
            <Sparkles className="h-4 w-4" />
            Capability grid
          </div>
          <h2 className="mb-6 text-4xl font-black md:text-6xl tracking-tighter text-[var(--foreground)]">
            {siteCopy.skillsHeading}
          </h2>
          <p className="mx-auto max-w-2xl text-lg md:text-xl font-medium">
            {siteCopy.skillsSubtitle}
          </p>
          <div className="mx-auto mt-8 h-1 w-24 bg-[var(--foreground)] editorial-border rounded-full" />
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={12} />
        ) : (
          <ExpandableSection collapsedMaxHeightPx={900}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8">
              {visibleSkills.length === 0 ? (
                <div className="col-span-full text-center font-bold text-lg">{siteCopy.skillsEmpty}</div>
              ) : (
                visibleSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id || index}
                    initial={reducedMotion ? false : { opacity: 0, y: 30, scale: 0.98 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    transition={reducedMotion ? undefined : { duration: 0.6, delay: index * 0.05, ease: [0.42, 0, 0.58, 1] }}
                    whileHover={reducedMotion ? undefined : { y: -6, scale: 1.02 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="paper-card p-6 md:p-8"
                  >
                    <div className="mb-6 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] shadow-[2px_2px_0_0_rgba(42,36,31,0.1)] transition-transform duration-300 md:h-16 md:w-16">
                      <SkillIcon title={skill.title} icon={skill.icon} className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-black tracking-tight text-[var(--foreground)]">{skill.title}</h3>
                      <p className="text-base font-medium">{skill.description}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {getSkillTags(skill).map((tag) => (
                        <span key={tag} className="paper-chip px-3 py-1.5 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ExpandableSection>
        )}
      </div>
    </section>
  );
}