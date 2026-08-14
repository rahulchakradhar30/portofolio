"use client";

import React, { useMemo } from "react";
import type { HomepageConfig, PortfolioContent } from "@/app/lib/types";
import { PortfolioContentProvider, usePortfolioContent } from "./PortfolioContentProvider";
import ThemeRenderer from "./ThemeRenderer";

export type PreviewViewportMode = "desktop" | "tablet" | "mobile";

interface LiveWebsitePreviewProps {
  homepageConfig: HomepageConfig;
  selectedSectionId?: string | null;
  selectedBlockId?: string | null;
  viewportMode?: PreviewViewportMode;
  fitToView?: boolean;
  onSelectSection?: (sectionId: string) => void;
  className?: string;
}

/**
 * Inner Canvas component that renders the actual public website using draft state.
 */
function LivePreviewCanvas({
  homepageConfig,
  _selectedSectionId,
  _onSelectSection,
}: {
  homepageConfig: HomepageConfig;
  _selectedSectionId?: string | null;
  _onSelectSection?: (sectionId: string) => void;
}) {
  const { content } = usePortfolioContent();

  // Create merged content combining existing content with draft homepageConfig
  const draftPortfolioContent = useMemo<PortfolioContent>(() => {
    return {
      id: content?.id || "draft",
      heroTitle: content?.heroTitle || "PEREPOGU RAHUL CHAKRADHAR",
      heroSubtitle: content?.heroSubtitle || "AI ENTHUSIAST | TECH LEARNER | CONTENT CREATOR",
      heroTagline: content?.heroTagline || "CREATE YOUR OWN",
      aboutText: content?.aboutText || "",
      email: content?.email || "",
      location: content?.location || "Bengaluru, Karnataka",
      ...content,
      homepageConfig,
    };
  }, [content, homepageConfig]);

  return (
    <PortfolioContentProvider overrideContent={draftPortfolioContent}>
      <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 font-sans select-text">
        <ThemeRenderer />
      </div>
    </PortfolioContentProvider>
  );
}

/**
 * Responsive Device Container for True Live Website Preview
 */
export default function LiveWebsitePreview({
  homepageConfig,
  selectedSectionId,
  viewportMode = "desktop",
  fitToView = false,
  onSelectSection,
  className = "",
}: LiveWebsitePreviewProps) {
  return (
    <div className={`w-full overflow-x-auto bg-neutral-900/10 p-2 sm:p-3 rounded-2xl border border-[var(--border-color,rgba(0,0,0,0.1))] ${className}`}>
      {/* Device Viewport Wrapper */}
      <div
        className={`transition-all duration-300 mx-auto shadow-2xl overflow-y-auto max-h-[calc(100vh-210px)] min-h-[450px] ${
          fitToView ? "scale-[0.88] origin-top my-1" : ""
        } ${
          viewportMode === "mobile"
            ? "w-[375px] max-w-full rounded-[36px] border-[8px] border-neutral-900 bg-[var(--background)] shadow-2xl my-2"
            : viewportMode === "tablet"
            ? "w-[768px] max-w-full rounded-2xl border-4 border-neutral-800 bg-[var(--background)] shadow-xl my-2"
            : "w-full rounded-xl border border-[var(--border-color,rgba(0,0,0,0.12))] bg-[var(--background)]"
        }`}
      >
        <LivePreviewCanvas
          homepageConfig={homepageConfig}
          _selectedSectionId={selectedSectionId}
          _onSelectSection={onSelectSection}
        />
      </div>
    </div>
  );
}
