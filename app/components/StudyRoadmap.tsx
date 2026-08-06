"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import type { PortfolioContent, StudyRoadmapItem, StudyRoadmapMetricType, StudyRoadmapStageMetric } from "@/app/lib/types";
import ExpandableSection from "./ExpandableSection";
import { useMotionPreferences } from "./MotionProvider";

const DEFAULT_STUDY_ROADMAP: StudyRoadmapItem[] = [
  {
    id: "school",
    stage: "School",
    institution: "School Education",
    period: "Foundation Years",
    description: "Built academic fundamentals and consistent learning discipline.",
    tags: ["Basics", "Discipline", "Curiosity"],
    isHigherStudy: false,
  },
  {
    id: "high-school",
    stage: "High School",
    institution: "Secondary Education",
    period: "Higher Secondary",
    description: "Strengthened core subjects and developed problem-solving ability.",
    tags: ["Science", "Math", "Problem Solving"],
    isHigherStudy: false,
  },
  {
    id: "intermediate",
    stage: "Intermediate",
    institution: "Intermediate College",
    period: "Pre-University",
    description: "Prepared for advanced studies with structured technical focus.",
    tags: ["Pre-University", "Focus", "Preparation"],
    isHigherStudy: false,
  },
  {
    id: "university",
    stage: "Graduate / University",
    institution: "GITAM University, Bengaluru",
    period: "Current",
    description: "Building practical AI and software systems through applied projects.",
    tags: ["AI", "Engineering", "Projects"],
    isHigherStudy: false,
  },
];

const METRIC_LABEL_BY_TYPE: Record<StudyRoadmapMetricType, string> = {
  cgpa: "CGPA",
  ccpa: "CCPA",
  percentage: "Percentage",
  marks: "Marks",
  custom: "Metric",
};

const DEFAULT_STAGE_METRIC = (roadmapItemId: string): StudyRoadmapStageMetric => ({
  roadmapItemId,
  enabled: false,
  metricType: "percentage",
  label: "Percentage",
  value: "",
});

function normalizeRoadmap(items: unknown): StudyRoadmapItem[] {
  if (!Array.isArray(items)) return DEFAULT_STUDY_ROADMAP;

  const mapped = items
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const value = item as Partial<StudyRoadmapItem>;
      const tags = Array.isArray(value.tags)
        ? value.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
        : [];

      if (!value.stage || !value.institution || !value.period || !value.description) return null;

      return {
        id: value.id?.trim() || `stage-${index}`,
        stage: value.stage,
        institution: value.institution,
        period: value.period,
        description: value.description,
        tags,
        isHigherStudy: Boolean(value.isHigherStudy),
      } satisfies StudyRoadmapItem;
    })
    .filter((item): item is StudyRoadmapItem => Boolean(item));

  return mapped.length > 0 ? mapped : DEFAULT_STUDY_ROADMAP;
}

function normalizeStageMetrics(
  roadmapItems: StudyRoadmapItem[],
  metrics: unknown
): StudyRoadmapStageMetric[] {
  const defaultByStage = roadmapItems.map((item) => DEFAULT_STAGE_METRIC(item.id));

  // Backward compatibility for previous single metrics object.
  if (metrics && typeof metrics === "object" && !Array.isArray(metrics)) {
    const legacy = metrics as {
      showCgpa?: boolean;
      cgpaLabel?: string;
      cgpaValue?: string;
      showMarks?: boolean;
      marksLabel?: string;
      marksValue?: string;
    };
    const intermediateId = roadmapItems[2]?.id || roadmapItems[0]?.id;

    return defaultByStage.map((entry) => {
      if (entry.roadmapItemId !== intermediateId) return entry;
      if (legacy.showCgpa && legacy.cgpaValue) {
        return {
          ...entry,
          enabled: true,
          metricType: "cgpa",
          label: legacy.cgpaLabel || METRIC_LABEL_BY_TYPE.cgpa,
          value: legacy.cgpaValue,
        };
      }
      if (legacy.showMarks && legacy.marksValue) {
        return {
          ...entry,
          enabled: true,
          metricType: "percentage",
          label: legacy.marksLabel || METRIC_LABEL_BY_TYPE.percentage,
          value: legacy.marksValue,
        };
      }
      return entry;
    });
  }

  if (!Array.isArray(metrics)) return defaultByStage;

  const parsed = new Map<string, StudyRoadmapStageMetric>();
  for (const item of metrics) {
    if (!item || typeof item !== "object") continue;
    const value = item as Partial<StudyRoadmapStageMetric>;
    if (!value.roadmapItemId) continue;

    const metricType: StudyRoadmapMetricType =
      value.metricType === "cgpa" ||
      value.metricType === "ccpa" ||
      value.metricType === "percentage" ||
      value.metricType === "marks" ||
      value.metricType === "custom"
        ? value.metricType
        : "percentage";

    parsed.set(value.roadmapItemId, {
      roadmapItemId: value.roadmapItemId,
      enabled: Boolean(value.enabled),
      metricType,
      label: value.label?.trim() || METRIC_LABEL_BY_TYPE[metricType],
      value: value.value?.trim() || "",
    });
  }

  return roadmapItems.map((item) => parsed.get(item.id) || DEFAULT_STAGE_METRIC(item.id));
}

import { usePortfolioContent } from "./PortfolioContentProvider";
import { useRef } from "react";
import { useScroll, useSpring } from "framer-motion";

export default function StudyRoadmap() {
  const { content } = usePortfolioContent();
  const { reducedMotion, scrollEffectsEnabled } = useMotionPreferences();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const enabled = useMemo(() => {
    if (!content) return true;
    return content.studyRoadmapEnabled !== false && content.sectionVisibility?.roadmap !== false;
  }, [content]);

  const allowExtension = useMemo(() => {
    if (!content) return false;
    return Boolean(content.allowRoadmapExtension);
  }, [content]);

  const items = useMemo(() => {
    if (!content) return DEFAULT_STUDY_ROADMAP;
    return normalizeRoadmap(content.studyRoadmap);
  }, [content]);

  const metrics = useMemo(() => {
    if (!content) {
      return DEFAULT_STUDY_ROADMAP.map((item) => DEFAULT_STAGE_METRIC(item.id));
    }
    return normalizeStageMetrics(items, content.studyRoadmapMetrics);
  }, [content, items]);

  const visibleItems = useMemo(() => {
    const coreItems = items.filter((item) => !item.isHigherStudy);
    const higherStudies = items.filter((item) => item.isHigherStudy);

    if (!allowExtension) return coreItems;
    return [...coreItems, ...higherStudies];
  }, [allowExtension, items]);

  if (!enabled || visibleItems.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-4 py-24 sm:px-6 lg:py-32 lg:px-10" id="roadmap">
      <div className="relative z-10 mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16 text-center"
        >
          <div className="paper-chip mx-auto mb-6 inline-flex uppercase tracking-[0.24em] gap-2">
            <GraduationCap className="h-4 w-4" />
            Study roadmap
          </div>
          <h2 className="mb-6 text-4xl font-black md:text-6xl tracking-tighter text-[var(--foreground)]">
            Academic Journey
          </h2>
          <p className="mx-auto max-w-3xl text-lg md:text-xl font-medium">
            A horizontal roadmap of learning stages from school to university, with optional extension for higher studies.
          </p>
        </motion.div>

        <div className="relative">
          {/* Scroll progress living timeline beam */}
          <div className="pointer-events-none absolute left-0 right-0 top-[48%] hidden h-2 rounded-full editorial-border bg-[var(--surface-strong)] lg:block">
            {scrollEffectsEnabled ? (
              <motion.div style={{ scaleX, transformOrigin: "0%" }} className="h-full w-full bg-[var(--foreground)]" />
            ) : (
              <div className="h-full w-full bg-[var(--foreground)]/25" />
            )}
          </div>

          <ExpandableSection collapsedMaxHeightPx={800}>
            <div className="grid grid-cols-1 gap-6 lg:grid-flow-col lg:auto-cols-[minmax(300px,1fr)] lg:overflow-x-auto lg:pb-8 lg:pt-4">
              {visibleItems.map((item, index) => {
                const stageMetric = metrics.find((metric) => metric.roadmapItemId === item.id);
                const showMetric = Boolean(stageMetric?.enabled && stageMetric.value.trim());

                return (
                  <motion.article
                    key={item.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 30, scale: 0.98 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    whileHover={reducedMotion ? undefined : { y: -8 }}
                    transition={reducedMotion ? undefined : { duration: 0.6, delay: index * 0.05, ease: [0.42, 0, 0.58, 1] }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="paper-card p-6 sm:p-8"
                  >
                    <div className="paper-chip mb-6 inline-flex text-xs">
                      <span className="mr-2 h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                      {item.period}
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-[var(--foreground)]">{item.stage}</h3>
                    <p className="mt-2 text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{item.institution}</p>
                    <p className="mt-4 text-base font-medium leading-relaxed">{item.description}</p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="paper-chip px-3 py-1.5 text-xs font-bold bg-[var(--surface-soft)]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {showMetric ? (
                      <div className="mt-6 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface-strong)] px-5 py-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                          {(stageMetric?.label || METRIC_LABEL_BY_TYPE[stageMetric?.metricType || "percentage"]).trim()}
                        </div>
                        <div className="mt-2 text-xl font-black text-[var(--foreground)]">{stageMetric?.value}</div>
                      </div>
                    ) : null}

                    <div className="mt-6 hidden items-center gap-2 lg:flex">
                      <span className="h-3 w-3 rounded-full bg-[var(--accent)] editorial-border" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Stage {index + 1}</span>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </ExpandableSection>
        </div>
      </div>
    </section>
  );
}
