"use client";

import React, { useMemo } from "react";
import type { HomepageConfig, PortfolioContent } from "@/app/lib/types";
import { PortfolioContentProvider, usePortfolioContent } from "./PortfolioContentProvider";
import Header from "./Header";
import Footer from "./Footer";
import SectionRegistry from "./SectionRegistry";
import { Layers, Sparkles } from "lucide-react";

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
  selectedSectionId,
  onSelectSection,
}: {
  homepageConfig: HomepageConfig;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
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

  // Active visible sections in draft order
  const activeSections = useMemo(() => {
    return (homepageConfig.sections || [])
      .filter((sec) => sec.visible !== false)
      .sort((a, b) => a.order - b.order);
  }, [homepageConfig.sections]);

  return (
    <PortfolioContentProvider overrideContent={draftPortfolioContent}>
      <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 font-sans select-text">
        <Header />

        {activeSections.length === 0 ? (
          <div className="py-24 text-center px-4">
            <Layers className="w-12 h-12 text-[var(--accent)] mx-auto mb-3 opacity-60" />
            <h3 className="text-xl font-bold text-[var(--foreground)]">All Homepage Sections Hidden</h3>
            <p className="text-sm text-[var(--foreground)] opacity-70 mt-1 max-w-md mx-auto">
              Enable at least one section in the editor to view live rendering.
            </p>
          </div>
        ) : (
          activeSections.map((section) => {
            const isSelected = section.id === selectedSectionId;

            return (
              <div
                key={section.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSection?.(section.id);
                }}
                className={`relative group transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)] shadow-lg"
                    : "hover:ring-1 hover:ring-[var(--accent)]/40"
                }`}
              >
                {/* Editor Overlay Badge (Editor-Only) */}
                <div
                  className={`absolute top-2 right-4 z-20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-opacity shadow-sm flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[var(--accent)] text-white opacity-100"
                      : "bg-[var(--surface-soft)] text-[var(--foreground)] opacity-0 group-hover:opacity-100 border border-[var(--border-color,rgba(0,0,0,0.1))]"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>#{section.id} {isSelected ? "(Selected)" : "(Click to edit)"}</span>
                </div>

                {/* Actual Production Section Renderer */}
                <SectionRegistry section={section} />
              </div>
            );
          })
        )}

        <Footer />
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
          selectedSectionId={selectedSectionId}
          onSelectSection={onSelectSection}
        />
      </div>
    </div>
  );
}
