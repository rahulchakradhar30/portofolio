"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  MapPin,
  Globe,
  ExternalLink,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import type {
  HomepageSectionConfig,
  ExperienceItem,
  Skill,
  Project,
} from "@/app/lib/types";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { useMotionPreferences } from "./MotionProvider";
import GlassSurface from "./GlassSurface";
import SkillIcon from "./SkillIcon";

interface ExperienceProps {
  section: HomepageSectionConfig;
}

export default function Experience({ section }: ExperienceProps) {
  const { content: _content } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();

  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch experience items, skills, and projects
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [expRes, skillsRes, projRes] = await Promise.all([
          fetch("/api/experiences").then((r) => (r.ok ? r.json() : { experiences: [] })),
          fetch("/api/admin/skills").then((r) => (r.ok ? r.json() : { skills: [] })),
          fetch("/api/admin/projects").then((r) => (r.ok ? r.json() : { projects: [] })),
        ]);

        if (isMounted) {
          setExperiences(expRes.experiences || []);
          setSkills(skillsRes.skills || []);
          setProjects(projRes.projects || []);
        }
      } catch (err) {
        console.error("Failed to load experience data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const layoutMode = section.layoutMode || "vertical";
  const title = section.publicDisplayTitle || "Experience";
  const subtitle = section.subtitle || "Professional Career & Industry Experience";

  // Map skill IDs to full Skill objects
  const skillMap = useMemo(() => {
    const map = new Map<string, Skill>();
    skills.forEach((s) => map.set(s.id, s));
    return map;
  }, [skills]);

  // Map project IDs to full Project objects
  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  if (section.visible === false) return null;

  return (
    <section
      id="experience"
      className="scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36 py-12 lg:py-16 relative overflow-hidden"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-14">
        {/* Section Header */}
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-14 text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--surface-soft)] text-[var(--accent)] border border-[var(--border-color,rgba(0,0,0,0.08))] mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career Journey</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-3 text-base sm:text-lg text-[var(--foreground)] opacity-75 leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Empty State */}
        {!loading && experiences.length === 0 && (
          <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface)] max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-soft)] text-[var(--accent)] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">No Experience Recorded</h3>
            <p className="text-sm text-[var(--foreground)] opacity-70 mt-1">
              Experience entries will appear here once configured in the Admin Dashboard.
            </p>
          </div>
        )}

        {/* Timeline Content */}
        {experiences.length > 0 && (
          <div>
            {layoutMode === "horizontal" ? (
              <HorizontalSnakeTimeline
                experiences={experiences}
                skillMap={skillMap}
                projectMap={projectMap}
                reducedMotion={reducedMotion}
              />
            ) : (
              <VerticalTimeline
                experiences={experiences}
                skillMap={skillMap}
                projectMap={projectMap}
                reducedMotion={reducedMotion}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
 * VERTICAL TIMELINE LAYOUT
 * ============================================================ */
interface TimelineLayoutProps {
  experiences: ExperienceItem[];
  skillMap: Map<string, Skill>;
  projectMap: Map<string, Project>;
  reducedMotion?: boolean;
}

function VerticalTimeline({
  experiences,
  skillMap,
  projectMap,
  reducedMotion,
}: TimelineLayoutProps) {
  return (
    <div className="relative border-l-2 border-[var(--accent)]/30 ml-4 sm:ml-8 lg:ml-1/2 lg:-translate-x-1/2 space-y-10 lg:space-y-12 lg:border-l-2">
      {experiences.map((item, index) => {
        const isEven = index % 2 === 0;

        return (
          <motion.div
            key={item.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex flex-col lg:flex-row items-start ${
              isEven ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Timeline Node Marker Dot */}
            <div
              className="absolute -left-[25px] sm:-left-[41px] lg:left-1/2 lg:-translate-x-1/2 top-1.5 w-6 h-6 rounded-full bg-[var(--surface)] border-4 border-[var(--accent)] shadow-md z-10 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            </div>

            {/* Experience Card Container */}
            <div className="ml-6 sm:ml-10 lg:ml-0 lg:w-[calc(50%-2.5rem)] w-full">
              <ExperienceCard
                item={item}
                skillMap={skillMap}
                projectMap={projectMap}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * HORIZONTAL / SNAKE TIMELINE LAYOUT
 * ============================================================ */
function HorizontalSnakeTimeline({
  experiences,
  skillMap,
  projectMap,
  reducedMotion,
}: TimelineLayoutProps) {
  return (
    <div className="relative">
      {/* Desktop Snake Roadmap (Grid view with alternating direction flow) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative">
        {experiences.map((item, index) => (
          <motion.div
            key={item.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="relative flex flex-col"
          >
            {/* Snake Sequence Badge Header */}
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-[var(--accent)]">
              <span className="w-6 h-6 rounded-full bg-[var(--surface-soft)] border border-[var(--accent)]/30 flex items-center justify-center">
                {index + 1}
              </span>
              <span className="uppercase tracking-widest text-[10px]">
                Stage {index + 1}
              </span>
            </div>

            <ExperienceCard
              item={item}
              skillMap={skillMap}
              projectMap={projectMap}
            />
          </motion.div>
        ))}
      </div>

      {/* Mobile Safe Adaptation (Single Column Timeline with connection line to avoid horizontal overflow) */}
      <div className="md:hidden border-l-2 border-[var(--accent)]/30 ml-4 space-y-8">
        {experiences.map((item, index) => (
          <motion.div
            key={item.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="relative ml-6"
          >
            <div
              className="absolute -left-[31px] top-1.5 w-5 h-5 rounded-full bg-[var(--surface)] border-3 border-[var(--accent)] shadow-sm z-10"
              aria-hidden="true"
            />
            <ExperienceCard
              item={item}
              skillMap={skillMap}
              projectMap={projectMap}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * EXPERIENCE CARD COMPONENT
 * ============================================================ */
interface CardProps {
  item: ExperienceItem;
  skillMap: Map<string, Skill>;
  projectMap: Map<string, Project>;
}

function ExperienceCard({ item, skillMap, projectMap }: CardProps) {
  const [logoError, setLogoError] = useState(false);
  const relatedProject = item.relatedProjectId ? projectMap.get(item.relatedProjectId) : null;

  // Resolve skills and tech objects from IDs
  const skillItems = useMemo(() => {
    if (!Array.isArray(item.skills)) return [];
    return item.skills
      .map((id) => skillMap.get(id))
      .filter((s): s is Skill => Boolean(s));
  }, [item.skills, skillMap]);

  const techItems = useMemo(() => {
    if (!Array.isArray(item.technologies)) return [];
    return item.technologies
      .map((id) => skillMap.get(id))
      .filter((s): s is Skill => Boolean(s));
  }, [item.technologies, skillMap]);

  // Merge unique skills & technologies for badge rendering
  const allAssociatedSkills = useMemo(() => {
    const merged = new Map<string, Skill>();
    skillItems.forEach((s) => merged.set(s.id, s));
    techItems.forEach((t) => merged.set(t.id, t));
    return Array.from(merged.values());
  }, [skillItems, techItems]);

  return (
    <GlassSurface
      sectionId="experience"
      className="paper-card p-6 sm:p-7 rounded-2xl border border-[var(--border-color,rgba(0,0,0,0.1))] bg-[var(--surface)] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
    >
      <div>
        {/* Top Header: Company Logo & Basic Meta */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Company Logo or Fallback SVG Icon */}
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-color,rgba(0,0,0,0.08))] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {item.companyLogo && !logoError ? (
                <Image
                  src={item.companyLogo}
                  alt={`${item.companyName} logo`}
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Building2 className="w-6 h-6 text-[var(--accent)]" />
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight leading-snug">
                {item.role}
              </h3>
              <div className="flex items-center gap-2 flex-wrap text-sm font-semibold text-[var(--foreground)] opacity-85 mt-0.5">
                <span>{item.companyName}</span>
                {item.companyUrl && (
                  <a
                    href={item.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-xs text-[var(--accent)] hover:underline"
                    title={`Visit ${item.companyName} website`}
                  >
                    <Globe className="w-3 h-3" />
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Current / Employment Type Badge */}
          {item.employmentType && (
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--surface-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
              {item.employmentType}
            </span>
          )}
        </div>

        {/* Metadata Bar: Date Range, Location, Work Mode */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-medium text-[var(--foreground)] opacity-70 mb-5 pb-4 border-b border-[var(--border-color,rgba(0,0,0,0.08))]">
          {/* Dates */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <time className="font-mono">
              {item.startDate || "Start"} — {item.isCurrent ? "Present" : item.endDate || "End"}
            </time>
          </div>

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span>{item.location}</span>
            </div>
          )}

          {/* Work Mode */}
          {item.workMode && (
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[var(--surface-soft)] opacity-90 border border-[var(--border-color,rgba(0,0,0,0.08))]">
              {item.workMode}
            </span>
          )}
        </div>

        {/* Short & Detailed Descriptions */}
        {item.shortDescription && (
          <p className="text-sm sm:text-base text-[var(--foreground)] opacity-90 font-medium leading-relaxed mb-4">
            {item.shortDescription}
          </p>
        )}

        {item.detailedDescription && (
          <p className="text-xs sm:text-sm text-[var(--foreground)] opacity-75 leading-relaxed mb-4">
            {item.detailedDescription}
          </p>
        )}

        {/* Achievements / Responsibilities Bullet List */}
        {Array.isArray(item.achievements) && item.achievements.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Key Achievements & Responsibilities
            </h4>
            <ul className="space-y-2">
              {item.achievements.map((bullet, idx) => (
                <li
                  key={idx}
                  className="text-xs sm:text-sm text-[var(--foreground)] opacity-85 flex items-start gap-2 leading-relaxed"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Meta: Skills Gained & Related Project */}
      <div className="mt-4 pt-4 border-t border-[var(--border-color,rgba(0,0,0,0.08))] space-y-3">
        {/* Skills & Technologies Chips */}
        {allAssociatedSkills.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-60 mb-2">
              Skills & Tech Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allAssociatedSkills.map((sk) => (
                <div
                  key={sk.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border-color,rgba(0,0,0,0.08))] hover:border-[var(--accent)] transition-colors"
                >
                  <SkillIcon title={sk.title} icon={sk.icon} className="w-3.5 h-3.5" />
                  <span>{sk.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Project Link */}
        {relatedProject && (
          <div className="pt-2">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-soft)] text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-white transition-all group"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Related Project: <strong>{relatedProject.title}</strong></span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </GlassSurface>
  );
}
