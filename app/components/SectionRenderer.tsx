"use client";

import React, { useMemo } from "react";
import { usePortfolioContent } from "./PortfolioContentProvider";
import SectionErrorBoundary from "./SectionErrorBoundary";
import Hero from "./Hero";
import About from "./About";
import StudyRoadmap from "./StudyRoadmap";
import PortfolioRadar from "./PortfolioRadar";
import Skills from "./Skills";
import Projects from "./Projects";
import Certifications from "./Certifications";
import Contact from "./Contact";
import type { SectionLayoutConfig } from "@/app/lib/types";

export const DEFAULT_SECTION_ORDER = [
  "hero",
  "about",
  "roadmap",
  "radar",
  "skills",
  "projects",
  "certifications",
  "contact",
];

const SECTION_COMPONENTS: Record<string, { label: string; component: React.ComponentType }> = {
  hero: { label: "Hero", component: Hero },
  about: { label: "About", component: About },
  roadmap: { label: "Academic Track", component: StudyRoadmap },
  radar: { label: "Portfolio Radar", component: PortfolioRadar },
  skills: { label: "Skills", component: Skills },
  projects: { label: "Projects", component: Projects },
  certifications: { label: "Certifications", component: Certifications },
  contact: { label: "Contact", component: Contact },
};

interface SectionRendererProps {
  overrideOrder?: string[];
  overrideLayouts?: Record<string, SectionLayoutConfig>;
}

export default function SectionRenderer({
  overrideOrder,
  overrideLayouts,
}: SectionRendererProps) {
  const { content } = usePortfolioContent();

  const siteEditorConfig = content?.siteEditorConfig;

  const sectionOrder = useMemo(() => {
    const rawOrder = overrideOrder || siteEditorConfig?.sectionOrder || DEFAULT_SECTION_ORDER;
    // Filter out invalid section ids and append any missing standard sections
    const valid = rawOrder.filter((id) => id in SECTION_COMPONENTS);
    const missing = DEFAULT_SECTION_ORDER.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  }, [overrideOrder, siteEditorConfig?.sectionOrder]);

  const layouts = useMemo(() => {
    return overrideLayouts || siteEditorConfig?.sectionLayouts || {};
  }, [overrideLayouts, siteEditorConfig?.sectionLayouts]);

  return (
    <>
      {sectionOrder.map((sectionId) => {
        const item = SECTION_COMPONENTS[sectionId];
        if (!item) return null;

        const layoutConfig = layouts[sectionId] || {};
        const isVisibleInLayout = layoutConfig.visible !== false;
        
        // Also respect existing root content.sectionVisibility if present
        const dbVisibility = content?.sectionVisibility as Record<string, boolean> | undefined;
        const isVisibleInDb = dbVisibility ? dbVisibility[sectionId] !== false : true;

        if (!isVisibleInLayout || !isVisibleInDb) {
          return null;
        }

        const Component = item.component;

        // Apply controlled layout styling classes safely
        let spacingClass = "scroll-mt-28 sm:scroll-mt-32 lg:scroll-mt-36";
        if (layoutConfig.spacing === "compact") {
          spacingClass += " py-4 sm:py-6";
        } else if (layoutConfig.spacing === "large") {
          spacingClass += " py-16 sm:py-24";
        }

        let containerClass = "mx-auto px-4 sm:px-6 lg:px-10";
        if (layoutConfig.width === "narrow") {
          containerClass += " max-w-4xl";
        } else if (layoutConfig.width === "wide") {
          containerClass += " max-w-[1600px]";
        } else {
          containerClass += " max-w-7xl";
        }

        if (layoutConfig.alignment === "center") {
          containerClass += " text-center";
        } else if (layoutConfig.alignment === "right") {
          containerClass += " text-right";
        }

        return (
          <section key={sectionId} id={sectionId} className={spacingClass}>
            <div className={containerClass}>
              <SectionErrorBoundary sectionName={item.label}>
                <Component />
              </SectionErrorBoundary>
            </div>
          </section>
        );
      })}
    </>
  );
}
