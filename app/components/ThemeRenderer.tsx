"use client";

import React, { useMemo } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SectionRegistry from "./SectionRegistry";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { normalizeHomepageConfig } from "@/app/lib/homepageConfig";
import { getActiveThemeMode } from "@/app/lib/themeResolver";
import Theme2Renderer from "./theme2/Theme2Renderer";
import type { HomepageSectionConfig } from "@/app/lib/types";

export default function ThemeRenderer({
  initialSections,
}: {
  initialSections?: HomepageSectionConfig[];
}) {
  const { content } = usePortfolioContent();

  const themeMode = getActiveThemeMode(content?.themeConfig);

  const activeSections = useMemo(() => {
    if (content?.homepageConfig) {
      const norm = normalizeHomepageConfig(content.homepageConfig);
      return norm.sections.filter((sec) => sec.visible !== false);
    }
    return initialSections || [];
  }, [content, initialSections]);

  if (themeMode === "spatial") {
    return <Theme2Renderer initialSections={activeSections} />;
  }

  // Standard Theme 01 Paper Layout
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
