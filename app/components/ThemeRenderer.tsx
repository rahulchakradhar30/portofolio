"use client";

import React, { useMemo } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SectionRegistry from "./SectionRegistry";
import SpatialWebsiteView from "./spatial/SpatialWebsiteView";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { getActiveThemeMode } from "@/app/lib/themeResolver";
import { normalizeHomepageConfig } from "@/app/lib/homepageConfig";
import type { HomepageSectionConfig } from "@/app/lib/types";

export default function ThemeRenderer({
  initialSections,
}: {
  initialSections?: HomepageSectionConfig[];
}) {
  const { content } = usePortfolioContent();

  const activeThemeMode = getActiveThemeMode(content?.themeConfig || content);

  const activeSections = useMemo(() => {
    if (content?.homepageConfig) {
      const norm = normalizeHomepageConfig(content.homepageConfig);
      return norm.sections.filter((sec) => sec.visible !== false);
    }
    return initialSections || [];
  }, [content, initialSections]);

  if (activeThemeMode === "spatial") {
    return <SpatialWebsiteView />;
  }

  // Fallback / Standard Theme 01 Paper Layout
  return (
    <>
      <Header />
      {activeSections.map((section) => (
        <SectionRegistry key={section.id} section={section} />
      ))}
      <Footer />
    </>
  );
}
