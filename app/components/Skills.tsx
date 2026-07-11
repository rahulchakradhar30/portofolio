"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Skill } from "@/app/lib/types";
import { resolveSkillIconUrl } from "@/app/lib/skillLogoCatalog";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import LoadingSkeleton from "./LoadingSkeleton";
import ExpandableSection from "./ExpandableSection";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { Sparkles } from "lucide-react";
import { usePortfolioContent } from "./PortfolioContentProvider";

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
  const { content, loading: contentLoading, error: contentError } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
      <section className="section-soft relative min-h-screen overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <LoadingSkeleton variant="cards" />
      </section>
    );
  }
  if (!isVisible) return null;

  const orderedSkills = prioritizeFeatured(skills);
  const visibleSkills = orderedSkills.slice(0, 12);

  return (
    <section className="section-soft relative min-h-screen overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(122,95,71,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(122,95,71,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a5f47]">
            <Sparkles className="h-3.5 w-3.5" />
            Capability grid
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-[#7a5f47] via-[#b6926d] to-[#9b7a5b] bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            {siteCopy.skillsHeading}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm leading-relaxed text-[#6a5846] sm:text-base md:text-xl">
            {siteCopy.skillsSubtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-[#8d6b4e] to-[#c4a884] md:mt-6 md:w-24" />
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={12} />
        ) : (
          <ExpandableSection collapsedMaxHeightPx={840}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 lg:gap-8">
              {visibleSkills.length === 0 ? (
                <div className="col-span-full text-center text-[#7a5f47]">{siteCopy.skillsEmpty}</div>
              ) : (
                visibleSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id || index}
                    initial={reducedMotion ? false : { opacity: 0, y: 40 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={reducedMotion ? undefined : { duration: 0.55, delay: index * 0.08 }}
                    whileHover={reducedMotion ? undefined : { y: -10, scale: 1.02 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="premium-card rounded-[1.75rem] p-5 text-[#2f241b] transition-all duration-300 hover:border-[#8d6b4e]/30 md:p-8"
                  >
                    <div className="mb-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(235,216,188,0.7)_0%,rgba(196,168,132,0.4)_100%)] shadow-lg md:mb-6 md:h-16 md:w-16">
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
                      <h3 className="text-lg font-bold text-[#2f241b] md:text-2xl">{skill.title}</h3>
                      <p className="text-sm leading-relaxed text-[#6a5846] md:text-base">{skill.description}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 md:mt-6">
                      {getSkillTags(skill).map((tag) => (
                        <span key={tag} className="rounded-full border border-[#7a5f47]/12 bg-white px-3 py-1 text-xs font-medium text-[#6a5846]">
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