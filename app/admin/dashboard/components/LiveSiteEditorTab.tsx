"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  Sparkles,
  Grid,
  Type,
  Layout,
  Sliders,
  CheckCircle,
  AlertCircle,
  Play,
} from "lucide-react";
import type {
  PortfolioContent,
  SiteEditorConfig,
  SectionLayoutConfig,
  ProjectGridConfig,
  TypographyStyle,
  SupportedAnimationType,
} from "@/app/lib/types";
import TypographyControl from "./TypographyControl";
import SectionRenderer, { DEFAULT_SECTION_ORDER } from "@/app/components/SectionRenderer";
import { applyThemeTokensToDOM, getActiveTheme } from "@/app/lib/themeResolver";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  about: "About Section",
  roadmap: "Academic Track (Study Roadmap)",
  radar: "Portfolio Radar",
  skills: "Skills Grid",
  projects: "Projects Showcase",
  certifications: "Certifications",
  contact: "Contact & Hire Section",
};

export default function LiveSiteEditorTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Staged local editor draft state
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeEditorPanel, setActiveEditorPanel] = useState<"sections" | "grid" | "typography" | "animations">("sections");
  
  const [stagedOrder, setStagedOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [stagedLayouts, setStagedLayouts] = useState<Record<string, SectionLayoutConfig>>({});
  const [stagedGrid, setStagedGrid] = useState<ProjectGridConfig>({
    desktopColumns: 3,
    tabletColumns: 2,
    mobileColumns: 1,
  });
  const [stagedTypography, setStagedTypography] = useState<Record<string, TypographyStyle>>({});
  const [selectedSectionForAnim, setSelectedSectionForAnim] = useState<string>("hero");
  const [animType, setAnimType] = useState<SupportedAnimationType>("fade");
  const [animDuration, setAnimDuration] = useState<number>(0.6);
  const [animDelay, setAnimDelay] = useState<number>(0);

  // Load published configuration
  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch site content");
        return res.json();
      })
      .then((data) => {
        const loadedContent = data.content as PortfolioContent | null;
        setContent(loadedContent);
        if (loadedContent) {
          const config = loadedContent.siteEditorConfig;
          if (config?.sectionOrder && Array.isArray(config.sectionOrder)) {
            setStagedOrder(config.sectionOrder);
          }
          if (config?.sectionLayouts) {
            setStagedLayouts(config.sectionLayouts);
          }
          if (config?.projectGridConfig) {
            setStagedGrid(config.projectGridConfig);
          }
          if (config?.typographyOverrides) {
            setStagedTypography(config.typographyOverrides);
          }

          // Apply active theme to document DOM
          if (loadedContent.themeConfig) {
            const activeTheme = getActiveTheme(loadedContent.themeConfig);
            applyThemeTokensToDOM(activeTheme.tokens);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading site editor content:", err);
        setStatusMessage({ type: "error", text: "Failed to load current website configuration." });
      })
      .finally(() => setLoading(false));
  }, []);

  // Section reordering handlers
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...stagedOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const [movedItem] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, movedItem);
    setStagedOrder(newOrder);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setStagedLayouts((prev) => {
      const current = prev[sectionId] || {};
      return {
        ...prev,
        [sectionId]: {
          ...current,
          visible: current.visible === false ? true : false,
        },
      };
    });
  };

  const updateSectionLayout = (sectionId: string, updates: Partial<SectionLayoutConfig>) => {
    setStagedLayouts((prev) => {
      const current = prev[sectionId] || {};
      return {
        ...prev,
        [sectionId]: {
          ...current,
          ...updates,
        },
      };
    });
  };

  // Typography update handler
  const handleTypographyChange = (key: string, style?: TypographyStyle) => {
    setStagedTypography((prev) => {
      if (!style) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: style };
    });
  };

  // Reset controls
  const handleResetToPublished = () => {
    const config = content?.siteEditorConfig;
    setStagedOrder(config?.sectionOrder || DEFAULT_SECTION_ORDER);
    setStagedLayouts(config?.sectionLayouts || {});
    setStagedGrid(config?.projectGridConfig || { desktopColumns: 3, tabletColumns: 2, mobileColumns: 1 });
    setStagedTypography(config?.typographyOverrides || {});
    setStatusMessage({ type: "success", text: "Reset staged edits to currently published configuration." });
  };

  const handleResetAllToDefault = () => {
    setStagedOrder(DEFAULT_SECTION_ORDER);
    setStagedLayouts({});
    setStagedGrid({ desktopColumns: 3, tabletColumns: 2, mobileColumns: 1 });
    setStagedTypography({});
    setStatusMessage({ type: "success", text: "Reset staged edits to site defaults." });
  };

  // Publish configuration to database
  const handlePublish = async () => {
    if (!content) return;
    setSaving(true);
    setStatusMessage(null);

    const updatedSiteEditorConfig: SiteEditorConfig = {
      sectionOrder: stagedOrder,
      sectionLayouts: stagedLayouts,
      projectGridConfig: stagedGrid,
      typographyOverrides: stagedTypography,
      updatedAt: new Date().toISOString(),
    };

    // Construct updated animation config if animation panel was edited
    const existingAnimConfig = content.animationConfig || {
      enabled: true,
      global: { type: "fade", duration: 0.6, delay: 0 },
    };

    const updatedAnimConfig = {
      ...existingAnimConfig,
      sections: {
        ...(existingAnimConfig.sections || {}),
        [selectedSectionForAnim]: {
          type: animType,
          duration: animDuration,
          delay: animDelay,
          enabled: true,
        },
      },
    };

    const payload = {
      ...content,
      siteEditorConfig: updatedSiteEditorConfig,
      animationConfig: updatedAnimConfig,
    };

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to publish site editor configuration.");
      }

      setContent(payload);
      setStatusMessage({ type: "success", text: "Live Site Editor changes published successfully!" });
    } catch (err) {
      console.error("Error publishing live site editor changes:", err);
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--foreground)]/60">Loading Live Site Editor...</div>;
  }

  // Calculate preview container max-width based on responsive viewport mode
  const previewWidthStyle =
    viewportMode === "mobile"
      ? "max-w-[395px]"
      : viewportMode === "tablet"
      ? "max-w-[768px]"
      : "max-w-full";

  return (
    <div className="space-y-6">
      {/* Top Header Bar & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--foreground)]/15 bg-[var(--surface-soft)]">
        <div>
          <h2 className="text-2xl font-black text-[var(--foreground)] flex items-center gap-2">
            <Layout className="w-6 h-6 text-[var(--accent)]" />
            Live Site Layout Editor
          </h2>
          <p className="text-xs text-[var(--foreground)]/70 mt-1">
            Visually configure public layout structure, section ordering, visibility, spacing, project grid, and typography controls in real-time preview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToPublished}
            disabled={saving}
            className="paper-button px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
            title="Discard staged edits"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Published
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving}
            className="paper-button-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {saving ? "Publishing..." : "Publish Changes"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2 text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-700"
              : "bg-red-500/10 border-red-500/30 text-red-700"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Editor Controls & Viewport Navigation Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Editor Control Panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Panel Selector Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--foreground)]/15 bg-[var(--surface-soft)]">
            <button
              type="button"
              onClick={() => setActiveEditorPanel("sections")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeEditorPanel === "sections"
                  ? "bg-[var(--foreground)] text-[var(--surface)] shadow"
                  : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Sections & Order
            </button>
            <button
              type="button"
              onClick={() => setActiveEditorPanel("grid")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeEditorPanel === "grid"
                  ? "bg-[var(--foreground)] text-[var(--surface)] shadow"
                  : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Project Grid
            </button>
            <button
              type="button"
              onClick={() => setActiveEditorPanel("typography")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeEditorPanel === "typography"
                  ? "bg-[var(--foreground)] text-[var(--surface)] shadow"
                  : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Typography
            </button>
            <button
              type="button"
              onClick={() => setActiveEditorPanel("animations")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeEditorPanel === "animations"
                  ? "bg-[var(--foreground)] text-[var(--surface)] shadow"
                  : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Animations
            </button>
          </div>

          {/* Panel 1: Section Order & Layout Controls */}
          {activeEditorPanel === "sections" && (
            <div className="paper-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider">Homepage Sections</h3>
                <button
                  type="button"
                  onClick={handleResetAllToDefault}
                  className="text-xs text-[var(--accent)] font-semibold hover:underline"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {stagedOrder.map((sectionId, index) => {
                  const layoutConfig = stagedLayouts[sectionId] || {};
                  const isVisible = layoutConfig.visible !== false;

                  return (
                    <div
                      key={sectionId}
                      className={`p-3 rounded-xl border transition ${
                        isVisible
                          ? "border-[var(--foreground)]/20 bg-[var(--surface)]"
                          : "border-[var(--foreground)]/10 bg-[var(--surface-soft)] opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-[var(--accent)]">{index + 1}.</span>
                          <span className="text-xs font-bold text-[var(--foreground)] truncate">
                            {SECTION_LABELS[sectionId] || sectionId}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSection(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-[var(--surface-soft)] disabled:opacity-30"
                            title="Move section up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(index, "down")}
                            disabled={index === stagedOrder.length - 1}
                            className="p-1 rounded hover:bg-[var(--surface-soft)] disabled:opacity-30"
                            title="Move section down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionVisibility(sectionId)}
                            className="p-1 rounded hover:bg-[var(--surface-soft)]"
                            title={isVisible ? "Hide section" : "Show section"}
                          >
                            {isVisible ? (
                              <Eye className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Section Size & Layout Controls */}
                      {isVisible && (
                        <div className="mt-3 pt-2 border-t border-[var(--foreground)]/10 grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-[var(--foreground)]/60 uppercase">Spacing</label>
                            <select
                              value={layoutConfig.spacing || "normal"}
                              onChange={(e) => updateSectionLayout(sectionId, { spacing: e.target.value as "compact" | "normal" | "large" })}
                              className="w-full text-xs rounded border border-[var(--foreground)]/20 bg-[var(--surface)] px-1.5 py-1"
                            >
                              <option value="compact">Compact</option>
                              <option value="normal">Normal</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[var(--foreground)]/60 uppercase">Width</label>
                            <select
                              value={layoutConfig.width || "standard"}
                              onChange={(e) => updateSectionLayout(sectionId, { width: e.target.value as "narrow" | "standard" | "wide" })}
                              className="w-full text-xs rounded border border-[var(--foreground)]/20 bg-[var(--surface)] px-1.5 py-1"
                            >
                              <option value="narrow">Narrow</option>
                              <option value="standard">Standard</option>
                              <option value="wide">Wide</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[var(--foreground)]/60 uppercase">Align</label>
                            <select
                              value={layoutConfig.alignment || "left"}
                              onChange={(e) => updateSectionLayout(sectionId, { alignment: e.target.value as "left" | "center" | "right" })}
                              className="w-full text-xs rounded border border-[var(--foreground)]/20 bg-[var(--surface)] px-1.5 py-1"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Panel 2: Project Grid Controls */}
          {activeEditorPanel === "grid" && (
            <div className="paper-card p-4 space-y-4">
              <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-[var(--accent)]" />
                Project Grid Columns
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    Desktop Columns ({stagedGrid.desktopColumns} Cols)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setStagedGrid((prev) => ({ ...prev, desktopColumns: cols }))}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          stagedGrid.desktopColumns === cols
                            ? "paper-button-primary"
                            : "paper-button"
                        }`}
                      >
                        {cols} Col
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    Tablet Columns ({stagedGrid.tabletColumns} Cols)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setStagedGrid((prev) => ({ ...prev, tabletColumns: cols }))}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          stagedGrid.tabletColumns === cols
                            ? "paper-button-primary"
                            : "paper-button"
                        }`}
                      >
                        {cols} Col
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    Mobile Columns ({stagedGrid.mobileColumns} Cols)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setStagedGrid((prev) => ({ ...prev, mobileColumns: cols }))}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          stagedGrid.mobileColumns === cols
                            ? "paper-button-primary"
                            : "paper-button"
                        }`}
                      >
                        {cols} Col
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel 3: Typography Controls */}
          {activeEditorPanel === "typography" && (
            <div className="paper-card p-4 space-y-4">
              <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[var(--accent)]" />
                Granular Content Typography
              </h3>

              <div className="space-y-3">
                <TypographyControl
                  label="Hero Heading"
                  styleValue={stagedTypography["heroTitle"]}
                  onChange={(style) => handleTypographyChange("heroTitle", style)}
                />
                <TypographyControl
                  label="Section Headings"
                  styleValue={stagedTypography["sectionHeadings"]}
                  onChange={(style) => handleTypographyChange("sectionHeadings", style)}
                />
                <TypographyControl
                  label="Body Paragraphs"
                  styleValue={stagedTypography["bodyText"]}
                  onChange={(style) => handleTypographyChange("bodyText", style)}
                />
                <TypographyControl
                  label="Project Card Titles"
                  styleValue={stagedTypography["projectTitle"]}
                  onChange={(style) => handleTypographyChange("projectTitle", style)}
                />
              </div>
            </div>
          )}

          {/* Panel 4: Animation Controls */}
          {activeEditorPanel === "animations" && (
            <div className="paper-card p-4 space-y-4">
              <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                Framer Motion Section Overrides
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Target Section</label>
                  <select
                    value={selectedSectionForAnim}
                    onChange={(e) => setSelectedSectionForAnim(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[var(--foreground)]/20 bg-[var(--surface)] p-2"
                  >
                    {DEFAULT_SECTION_ORDER.map((id) => (
                      <option key={id} value={id}>
                        {SECTION_LABELS[id] || id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Animation Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["fade", "slide", "scale", "reveal", "stagger", "float"] as SupportedAnimationType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAnimType(t)}
                        className={`py-1.5 text-xs font-bold rounded-lg border uppercase transition ${
                          animType === t ? "paper-button-primary" : "paper-button"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    Duration ({animDuration}s)
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="2.0"
                    step="0.1"
                    value={animDuration}
                    onChange={(e) => setAnimDuration(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    Delay ({animDelay}s)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={animDelay}
                    onChange={(e) => setAnimDelay(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Staged Live Preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--foreground)]/15 bg-[var(--surface-soft)]">
            <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 uppercase tracking-wider">
              <Play className="w-3.5 h-3.5 text-[var(--accent)]" />
              Staged Live Preview
            </span>

            {/* Responsive Viewport Switcher */}
            <div className="inline-flex rounded-lg border border-[var(--foreground)]/20 bg-[var(--surface)] p-0.5">
              <button
                type="button"
                onClick={() => setViewportMode("desktop")}
                className={`p-1.5 rounded text-xs font-bold transition flex items-center gap-1 ${
                  viewportMode === "desktop"
                    ? "bg-[var(--foreground)] text-[var(--surface)]"
                    : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("tablet")}
                className={`p-1.5 rounded text-xs font-bold transition flex items-center gap-1 ${
                  viewportMode === "tablet"
                    ? "bg-[var(--foreground)] text-[var(--surface)]"
                    : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("mobile")}
                className={`p-1.5 rounded text-xs font-bold transition flex items-center gap-1 ${
                  viewportMode === "mobile"
                    ? "bg-[var(--foreground)] text-[var(--surface)]"
                    : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>
          </div>

          {/* Staged Site Render Frame Container */}
          <div className="flex justify-center bg-[var(--foreground)]/5 p-4 rounded-2xl border border-[var(--foreground)]/15 overflow-hidden">
            <motion.div
              layout
              className={`w-full ${previewWidthStyle} transition-all duration-300 bg-[var(--background)] rounded-xl border border-[var(--foreground)]/20 shadow-2xl overflow-y-auto max-h-[720px] p-2 space-y-4`}
            >
              <div className="text-[10px] font-mono text-center p-1 rounded bg-[var(--surface-strong)] text-[var(--foreground)]/70 uppercase">
                Staged Preview ({viewportMode.toUpperCase()}) — Staged Order: {stagedOrder.join(" → ")}
              </div>
              <SectionRenderer overrideOrder={stagedOrder} overrideLayouts={stagedLayouts} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
