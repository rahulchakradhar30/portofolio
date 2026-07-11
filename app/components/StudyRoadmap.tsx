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

export default function StudyRoadmap() {
  const { content } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();

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
    <section className="section-soft relative min-h-screen overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-10" id="roadmap">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(122,95,71,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(122,95,71,0.12)_1px,transparent_1px)] [background-size:46px_46px]" />

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-10 text-center md:mb-14"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a5f47]">
            <GraduationCap className="h-3.5 w-3.5" />
            Study roadmap
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-[#7a5f47] via-[#b6926d] to-[#9b7a5b] bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:text-5xl">
            Academic Journey
          </h2>
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-[#6a5846] sm:text-base md:text-lg">
            A horizontal roadmap of learning stages from school to university, with optional extension for higher studies.
          </p>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 right-0 top-[46%] hidden h-px bg-gradient-to-r from-[#c4a884]/10 via-[#8d6b4e]/60 to-[#b6926d]/20 lg:block" />

        <ExpandableSection collapsedMaxHeightPx={780}>
          <div className="grid grid-cols-1 gap-5 lg:grid-flow-col lg:auto-cols-[minmax(280px,1fr)] lg:overflow-x-auto lg:pb-2">
            {visibleItems.map((item, index) => {
              const stageMetric = metrics.find((metric) => metric.roadmapItemId === item.id);
              const showMetric = Boolean(stageMetric?.enabled && stageMetric.value.trim());

              return (
                <motion.article
                  key={item.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={reducedMotion ? undefined : { duration: 0.45, delay: index * 0.08 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="relative rounded-3xl border border-[#7a5f47]/12 bg-white p-5 text-[#2f241b] shadow-[0_16px_40px_rgba(122,95,71,0.1)]"
                >
                  <div className="mb-3 inline-flex items-center rounded-full border border-[#7a5f47]/15 bg-[#fbf7f0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a5f47]">
                    {item.period}
                  </div>
                  <h3 className="text-xl font-bold text-[#2f241b]">{item.stage}</h3>
                  <p className="mt-1 text-sm font-medium text-[#7a5f47]">{item.institution}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#6a5846]">{item.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#7a5f47]/12 bg-[#fbf7f0] px-3 py-1 text-xs text-[#6a5846]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {showMetric ? (
                    <div className="mt-4 rounded-xl border border-[#7a5f47]/15 bg-[#f7efe4] px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d6b4e]">
                        {(stageMetric?.label || METRIC_LABEL_BY_TYPE[stageMetric?.metricType || "percentage"]).trim()}
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#2f241b]">{stageMetric?.value}</div>
                    </div>
                  ) : null}

                  <div className="mt-4 hidden items-center gap-2 lg:flex">
                    <span className="h-2 w-2 rounded-full bg-[#8d6b4e]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8d6b4e]/80">Stage {index + 1}</span>
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
