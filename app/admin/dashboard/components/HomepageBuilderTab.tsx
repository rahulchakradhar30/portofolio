"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Copy,
  Save,
  Sparkles,
  Edit3,
  LayoutGrid,
  Menu,
  Type,
  Maximize2,
  RotateCcw,
  CheckCircle,
  FileText,
  MousePointer,
  HelpCircle,
  Monitor,
  Tablet,
  Smartphone,
  Split,
} from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type {
  HomepageConfig,
  HomepageSectionConfig,
  HomepageBlock,
  BlockType,
  BlockButton,
  BlockCard,
  BlockTimelineItem,
  NavigationItemConfig,
  ButtonStylePreset,
  ButtonDestinationType,
} from "@/app/lib/types";
import { getDefaultHomepageConfig, normalizeHomepageConfig, sanitizeDestinationUrl } from "@/app/lib/homepageConfig";
import BlockRegistry from "@/app/components/blocks/BlockRegistry";
import CustomSectionRenderer from "@/app/components/blocks/CustomSectionRenderer";
import LiveWebsitePreview, { PreviewViewportMode } from "@/app/components/LiveWebsitePreview";

const BLOCK_TYPE_OPTIONS: { type: BlockType; label: string; description: string }[] = [
  { type: "heading", label: "Heading", description: "Section heading or subhead (H2, H3, H4)" },
  { type: "paragraph", label: "Paragraph", description: "Editorial text paragraph with optional formatting" },
  { type: "button_group", label: "Button Group", description: "Interactive CTAs, links, and action buttons" },
  { type: "highlight_box", label: "Highlight Callout", description: "Highlighted editorial callout box with icon" },
  { type: "stat_box", label: "Stat / Metric Box", description: "Prominent metric or stat highlight box" },
  { type: "metric_grid", label: "Metric Grid", description: "Grid of metric cards with values and labels" },
  { type: "card_grid", label: "Card Grid", description: "Interactive cards with titles, descriptions, and buttons" },
  { type: "timeline_group", label: "Timeline / Journey", description: "Sequential roadmap timeline cards with visual connecting lines" },
  { type: "tag_group", label: "Tag / Badge Group", description: "Group of technology or capability badges" },
  { type: "image", label: "Image Block", description: "Image with caption and alt text" },
  { type: "divider", label: "Divider Line", description: "Clean paper layout separator line" },
];

export default function HomepageBuilderTab() {
  const [config, setConfig] = useState<HomepageConfig>(getDefaultHomepageConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [selectedSectionId, setSelectedSectionId] = useState<string>("hero");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"sections" | "blocks" | "navigation">("sections");
  const [viewportMode, setViewportMode] = useState<PreviewViewportMode>("desktop");
  const [viewLayout, setViewLayout] = useState<"split" | "full_preview" | "editor_only">("split");

  // Load content configuration
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPortfolioContent();
      if (res.success && res.content) {
        setConfig(normalizeHomepageConfig(res.content.homepageConfig));
      } else {
        setConfig(getDefaultHomepageConfig());
      }
    } catch {
      setConfig(getDefaultHomepageConfig());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    const updatedConfig: HomepageConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    const res = await adminAPI.updatePortfolioContent({
      homepageConfig: updatedConfig,
    });

    setSaving(false);
    if (res.success) {
      setSaveMessage("Homepage layout published successfully!");
      setTimeout(() => setSaveMessage(null), 4000);
    } else {
      setSaveMessage("Failed to publish homepage layout.");
    }
  };

  // Section operations
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...config.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Update order index
    const reordered = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setConfig({ ...config, sections: reordered });
  };

  const handleToggleSectionVisibility = (sectionId: string) => {
    const updated = config.sections.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s));
    setConfig({ ...config, sections: updated });
  };

  const handleToggleSectionNavVisibility = (sectionId: string) => {
    const updated = config.sections.map((s) => (s.id === sectionId ? { ...s, visibleInNav: !s.visibleInNav } : s));
    setConfig({ ...config, sections: updated });
  };

  const handleUpdateSectionMeta = (sectionId: string, updates: Partial<HomepageSectionConfig>) => {
    const updated = config.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s));
    setConfig({ ...config, sections: updated });
  };

  const handleCreateCustomSection = () => {
    const customId = `custom-${Date.now()}`;
    const newSec: HomepageSectionConfig = {
      id: customId,
      type: "custom",
      internalName: "New Custom Section",
      publicDisplayTitle: "Custom Showcase",
      visible: true,
      order: config.sections.length + 1,
      navLabel: "Custom",
      visibleInNav: true,
      isBuiltIn: false,
      layoutPreset: "paper",
      animationPreset: "fade",
      bgTreatment: "default",
      blocks: [
        {
          id: `block-${Date.now()}-1`,
          type: "heading",
          visible: true,
          order: 1,
          content: { headingText: "Custom Section Heading", headingLevel: "h3" },
          style: { spacing: "normal", align: "left" },
        },
        {
          id: `block-${Date.now()}-2`,
          type: "paragraph",
          visible: true,
          order: 2,
          content: { paragraphText: "Add your customized content, metrics, cards, or journey blocks here." },
          style: { spacing: "normal", align: "left" },
        },
      ],
    };

    const newNav: NavigationItemConfig = {
      sectionId: customId,
      visibleInNav: true,
      navLabel: "Custom",
      order: config.navItems.length + 1,
    };

    setConfig({
      ...config,
      sections: [...config.sections, newSec],
      navItems: [...config.navItems, newNav],
    });
    setSelectedSectionId(customId);
  };

  const handleDeleteCustomSection = (sectionId: string) => {
    const sec = config.sections.find((s) => s.id === sectionId);
    if (sec?.isBuiltIn) return;

    const newSections = config.sections.filter((s) => s.id !== sectionId);
    const newNavs = config.navItems.filter((n) => n.sectionId !== sectionId);

    setConfig({ ...config, sections: newSections, navItems: newNavs });
    setSelectedSectionId("hero");
  };

  const handleDuplicateCustomSection = (sectionId: string) => {
    const sec = config.sections.find((s) => s.id === sectionId);
    if (!sec) return;

    const dupId = `custom-${Date.now()}`;
    const dupSec: HomepageSectionConfig = {
      ...sec,
      id: dupId,
      internalName: `${sec.internalName} (Copy)`,
      publicDisplayTitle: `${sec.publicDisplayTitle} (Copy)`,
      isBuiltIn: false,
      order: config.sections.length + 1,
      blocks: sec.blocks.map((b, idx) => ({
        ...b,
        id: `block-${dupId}-${idx}`,
      })),
    };

    setConfig({
      ...config,
      sections: [...config.sections, dupSec],
    });
  };

  // Block operations inside selected section
  const currentSection = config.sections.find((s) => s.id === selectedSectionId);

  const handleAddBlock = (blockType: BlockType) => {
    if (!currentSection) return;

    const newBlockId = `block-${Date.now()}`;
    const newBlock: HomepageBlock = {
      id: newBlockId,
      type: blockType,
      visible: true,
      order: currentSection.blocks.length + 1,
      content: {
        headingText: blockType === "heading" ? "New Section Heading" : "",
        headingLevel: "h3",
        paragraphText: blockType === "paragraph" ? "Write concise, impactful editorial copy here." : "",
        highlightTitle: blockType === "highlight_box" ? "Key Takeaway" : "",
        highlightText: blockType === "highlight_box" ? "Important callout highlighting a core system capability." : "",
        highlightIcon: "Sparkles",
        statValue: blockType === "stat_box" ? "99%" : "",
        statLabel: blockType === "stat_box" ? "System Reliability" : "",
        tags: blockType === "tag_group" ? ["AI Systems", "Next.js", "Paper UX"] : [],
        buttons:
          blockType === "button_group"
            ? [
                {
                  id: `btn-${Date.now()}`,
                  text: "Explore Feature",
                  destinationType: "hash",
                  destination: "#projects",
                  stylePreset: "primary",
                  icon: "Sparkles",
                  visible: true,
                  order: 1,
                },
              ]
            : [],
        cards:
          blockType === "card_grid" || blockType === "metric_grid"
            ? [
                {
                  id: `crd-${Date.now()}-1`,
                  title: "System Architecture",
                  subtitle: "High-trust design",
                  description: "Modular components with paper layout aesthetics and zero bloat.",
                  badge: "Feature",
                  statValue: "100%",
                  statLabel: "Tested",
                  visible: true,
                  order: 1,
                },
              ]
            : [],
        timelineItems:
          blockType === "timeline_group"
            ? [
                {
                  id: `time-${Date.now()}-1`,
                  stageNumber: "01",
                  stageTitle: "Academic Foundation",
                  institution: "GITAM University",
                  period: "2023 - Present",
                  description: "Specializing in AI/ML systems and modern software engineering.",
                  percentageOrStat: "9.0 CGPA",
                  statLabel: "CGPA",
                  tags: ["AI", "Algorithms", "Systems"],
                  isCurrent: true,
                  visible: true,
                  order: 1,
                },
              ]
            : [],
      },
      style: {
        spacing: "normal",
        width: "standard",
        align: "left",
        columnsDesktop: 3,
        animationPreset: "fade",
      },
    };

    const updatedBlocks = [...currentSection.blocks, newBlock];
    handleUpdateSectionMeta(selectedSectionId, { blocks: updatedBlocks });
    setSelectedBlockId(newBlockId);
  };

  const handleMoveBlock = (blockIndex: number, direction: "up" | "down") => {
    if (!currentSection) return;
    const newBlocks = [...currentSection.blocks];
    const targetIdx = direction === "up" ? blockIndex - 1 : blockIndex + 1;
    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;

    const temp = newBlocks[blockIndex];
    newBlocks[blockIndex] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;

    const reordered = newBlocks.map((b, idx) => ({ ...b, order: idx + 1 }));
    handleUpdateSectionMeta(selectedSectionId, { blocks: reordered });
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<HomepageBlock>) => {
    if (!currentSection) return;
    const updatedBlocks = currentSection.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
    handleUpdateSectionMeta(selectedSectionId, { blocks: updatedBlocks });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!currentSection) return;
    const updatedBlocks = currentSection.blocks.filter((b) => b.id !== blockId);
    handleUpdateSectionMeta(selectedSectionId, { blocks: updatedBlocks });
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  const handleDuplicateBlock = (blockId: string) => {
    if (!currentSection) return;
    const target = currentSection.blocks.find((b) => b.id === blockId);
    if (!target) return;

    const dupId = `block-${Date.now()}`;
    const dupBlock: HomepageBlock = {
      ...target,
      id: dupId,
      order: currentSection.blocks.length + 1,
    };

    handleUpdateSectionMeta(selectedSectionId, { blocks: [...currentSection.blocks, dupBlock] });
    setSelectedBlockId(dupId);
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--foreground)]/60 font-semibold">Loading Homepage Configuration...</div>;
  }

  const selectedBlock = currentSection?.blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="space-y-6">
      {/* Top Header & Save Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-6 shadow-[6px_6px_0_0_rgba(42,36,31,0.08)]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-black uppercase tracking-wider text-[var(--accent)]">
            <LayoutGrid className="h-3.5 w-3.5" />
            Homepage Content & Layout Engine
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
            Section & Block Builder
          </h2>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]/70">
            Control homepage layout, section order, navigation links, cards, timelines, callouts, and visual blocks in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Viewport Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] gap-1">
            <button
              type="button"
              onClick={() => setViewportMode("desktop")}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewportMode === "desktop"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--foreground)] opacity-70 hover:opacity-100"
              }`}
              title="Desktop Viewport"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("tablet")}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewportMode === "tablet"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--foreground)] opacity-70 hover:opacity-100"
              }`}
              title="Tablet Viewport (768px)"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("mobile")}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewportMode === "mobile"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--foreground)] opacity-70 hover:opacity-100"
              }`}
              title="Mobile Viewport (375px)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* View Layout Mode Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] gap-1">
            <button
              type="button"
              onClick={() => setViewLayout("split")}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewLayout === "split"
                  ? "bg-[var(--foreground)] text-[var(--surface)] shadow-sm"
                  : "text-[var(--foreground)] opacity-70 hover:opacity-100"
              }`}
              title="Split View (Editor + Live Preview)"
            >
              <Split className="w-4 h-4" />
              <span className="hidden md:inline">Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("full_preview")}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewLayout === "full_preview"
                  ? "bg-[var(--foreground)] text-[var(--surface)] shadow-sm"
                  : "text-[var(--foreground)] opacity-70 hover:opacity-100"
              }`}
              title="Full Live Preview"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">Full Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadConfig}
            className="paper-button inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold"
            title="Discard unsaved local draft changes"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Draft</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--foreground)] bg-[var(--accent)] px-5 py-2.5 text-xs font-black text-white shadow-[4px_4px_0_0_rgba(42,36,31,0.9)] transition-all duration-300 hover:bg-[var(--accent-strong)] hover:shadow-[6px_6px_0_0_rgba(42,36,31,1)]"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Publishing..." : "Publish Layout"}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-strong)] p-4 text-sm font-bold text-[var(--foreground)] shadow-[4px_4px_0_0_rgba(42,36,31,0.1)] flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-[var(--accent)]" />
          {saveMessage}
        </div>
      )}

      {/* FULL PREVIEW VIEW MODE */}
      {viewLayout === "full_preview" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-color,rgba(0,0,0,0.1))] flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[var(--foreground)]">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--accent)]" />
              <span>Full Website Live Renderer Preview (Active In-Memory Draft)</span>
            </span>
            <span className="opacity-70">
              Viewport: <strong className="uppercase">{viewportMode}</strong> • Click any section to select for editing
            </span>
          </div>

          <LiveWebsitePreview
            homepageConfig={config}
            selectedSectionId={selectedSectionId}
            viewportMode={viewportMode}
            onSelectSection={(secId) => setSelectedSectionId(secId)}
          />
        </div>
      )}

      {/* SPLIT VIEW MODE */}
      {viewLayout === "split" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.15fr] gap-6 items-start">
          {/* LEFT PANEL: EDITOR CONTROLS */}
          <div className="space-y-6">
            {/* Sub-Tab Navigation */}
            <div className="flex border-b-2 border-[var(--foreground)] gap-2">
              <button
                onClick={() => setActiveSubTab("sections")}
                className={`flex items-center gap-2 border-b-4 px-4 py-2.5 font-bold text-xs sm:text-sm transition-colors ${
                  activeSubTab === "sections"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
              >
                <Layers className="h-4 w-4" />
                Sections ({config.sections.length})
              </button>

              <button
                onClick={() => setActiveSubTab("blocks")}
                className={`flex items-center gap-2 border-b-4 px-4 py-2.5 font-bold text-xs sm:text-sm transition-colors ${
                  activeSubTab === "blocks"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
              >
                <Edit3 className="h-4 w-4" />
                Blocks ({currentSection?.blocks.length || 0})
              </button>

              <button
                onClick={() => setActiveSubTab("navigation")}
                className={`flex items-center gap-2 border-b-4 px-4 py-2.5 font-bold text-xs sm:text-sm transition-colors ${
                  activeSubTab === "navigation"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
              >
                <Menu className="h-4 w-4" />
                Navbar Controls
              </button>
            </div>

            {/* SUB-TAB 1: SECTIONS MANAGER */}
            {activeSubTab === "sections" && (
              <div className="space-y-6">
          {/* Section List & Ordering */}
          <div className="space-y-4 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-6 shadow-[4px_4px_0_0_rgba(42,36,31,0.08)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[var(--foreground)]">Homepage Section Order</h3>
              <button
                type="button"
                onClick={handleCreateCustomSection}
                className="paper-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Custom Section
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {config.sections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;
                return (
                  <div
                    key={sec.id}
                    className={`flex items-center justify-between rounded-xl border-2 p-3.5 transition-all ${
                      isSelected
                        ? "border-[var(--foreground)] bg-[var(--surface-strong)] shadow-[4px_4px_0_0_rgba(42,36,31,0.8)]"
                        : "border-[var(--foreground)]/30 bg-[var(--surface-soft)] hover:border-[var(--foreground)]"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-grow"
                      onClick={() => setSelectedSectionId(sec.id)}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--foreground)]/40 bg-[var(--surface)] text-xs font-black">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                          {sec.publicDisplayTitle}
                          {sec.isBuiltIn ? (
                            <span className="rounded bg-[var(--foreground)]/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-[var(--foreground)]/70">
                              Built-in
                            </span>
                          ) : (
                            <span className="rounded bg-[var(--accent)]/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-[var(--accent)]">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--foreground)]/60 font-medium">
                          ID: #{sec.id} • Nav: "{sec.navLabel}"
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleSectionVisibility(sec.id)}
                        className={`p-1.5 rounded-lg border border-[var(--foreground)]/30 ${
                          sec.visible ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"
                        }`}
                        title={sec.visible ? "Section Visible" : "Section Hidden"}
                      >
                        {sec.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-[var(--foreground)]/30 text-[var(--foreground)] disabled:opacity-30"
                      >
                        <MoveUp className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, "down")}
                        disabled={idx === config.sections.length - 1}
                        className="p-1.5 rounded-lg border border-[var(--foreground)]/30 text-[var(--foreground)] disabled:opacity-30"
                      >
                        <MoveDown className="h-4 w-4" />
                      </button>

                      {!sec.isBuiltIn && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDuplicateCustomSection(sec.id)}
                            className="p-1.5 rounded-lg border border-[var(--foreground)]/30 text-[var(--foreground)]"
                            title="Duplicate Custom Section"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection(sec.id)}
                            className="p-1.5 rounded-lg border border-[var(--foreground)]/30 text-rose-600"
                            title="Delete Custom Section"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Settings & Metadata */}
          {currentSection && (
            <div className="space-y-6 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-6 shadow-[4px_4px_0_0_rgba(42,36,31,0.08)]">
              <h3 className="text-lg font-black text-[var(--foreground)]">
                Configure #{currentSection.id} Section
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                    Public Display Title
                  </label>
                  <input
                    type="text"
                    value={currentSection.publicDisplayTitle}
                    onChange={(e) => handleUpdateSectionMeta(currentSection.id, { publicDisplayTitle: e.target.value })}
                    className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-4 py-2.5 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                    Section Subtitle / Lead Text
                  </label>
                  <input
                    type="text"
                    value={currentSection.subtitle || ""}
                    onChange={(e) => handleUpdateSectionMeta(currentSection.id, { subtitle: e.target.value })}
                    placeholder="Professional Career & Industry Experience"
                    className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-4 py-2.5 font-bold text-sm"
                  />
                </div>

                {currentSection.id === "experience" && (
                  <div className="p-4 rounded-xl border-2 border-[var(--accent)] bg-[var(--surface-soft)] space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-[var(--accent)]">
                      Experience Presentation Layout Mode
                    </label>
                    <select
                      value={currentSection.layoutMode || "vertical"}
                      onChange={(e) =>
                        handleUpdateSectionMeta(currentSection.id, {
                          layoutMode: e.target.value as "vertical" | "horizontal",
                        })
                      }
                      className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface)] px-3 py-2.5 font-bold text-sm"
                    >
                      <option value="vertical">Vertical Timeline Layout (Default)</option>
                      <option value="horizontal">Horizontal / Snake Roadmap Layout</option>
                    </select>
                    <p className="text-xs text-[var(--foreground)]/70 font-medium">
                      Vertical renders a classic chronological timeline. Horizontal / Snake renders a multi-column connected roadmap that adapts safely on mobile devices.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                      Navbar Link Label
                    </label>
                    <input
                      type="text"
                      value={currentSection.navLabel}
                      onChange={(e) => handleUpdateSectionMeta(currentSection.id, { navLabel: e.target.value })}
                      className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-4 py-2.5 font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                      Navbar Link Visibility
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggleSectionNavVisibility(currentSection.id)}
                      className={`w-full rounded-xl border-2 px-4 py-2.5 font-bold text-sm text-left flex items-center justify-between ${
                        currentSection.visibleInNav
                          ? "border-emerald-700 bg-emerald-500/10 text-emerald-800"
                          : "border-rose-700 bg-rose-500/10 text-rose-800"
                      }`}
                    >
                      <span>{currentSection.visibleInNav ? "Show in Navbar" : "Hide in Navbar"}</span>
                      {currentSection.visibleInNav ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                      Background Treatment
                    </label>
                    <select
                      value={currentSection.bgTreatment || "default"}
                      onChange={(e) =>
                        handleUpdateSectionMeta(currentSection.id, {
                          bgTreatment: e.target.value as HomepageSectionConfig["bgTreatment"],
                        })
                      }
                      className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-3 py-2.5 font-bold text-sm"
                    >
                      <option value="default">Default Surface</option>
                      <option value="soft">Soft Tint</option>
                      <option value="strong">Strong Tint</option>
                      <option value="glass">Glassmorphism</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                      Animation Preset
                    </label>
                    <select
                      value={currentSection.animationPreset || "fade"}
                      onChange={(e) =>
                        handleUpdateSectionMeta(currentSection.id, {
                          animationPreset: e.target.value as HomepageSectionConfig["animationPreset"],
                        })
                      }
                      className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-3 py-2.5 font-bold text-sm"
                    >
                      <option value="fade">Smooth Fade In</option>
                      <option value="slide">Slide Up</option>
                      <option value="scale">Subtle Scale Up</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[var(--foreground)]/20 flex items-center justify-between">
                  <div className="text-xs font-semibold text-[var(--foreground)]/70">
                    Blocks in this section: <strong>{currentSection.blocks.length}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("blocks")}
                    className="paper-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Manage Section Blocks
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: BLOCK BUILDER */}
      {activeSubTab === "blocks" && currentSection && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6">
          {/* Left Column: Section Selector & Block List */}
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-5 shadow-[4px_4px_0_0_rgba(42,36,31,0.08)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-2">
                Active Editing Section
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => {
                  setSelectedSectionId(e.target.value);
                  setSelectedBlockId(null);
                }}
                className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-strong)] px-4 py-3 font-black text-base shadow-[3px_3px_0_0_rgba(42,36,31,0.8)]"
              >
                {config.sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.publicDisplayTitle} (#{s.id}) {s.isBuiltIn ? "[Built-in]" : "[Custom]"}
                  </option>
                ))}
              </select>
            </div>

            {/* Block Adder Palette */}
            <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-5 space-y-3 shadow-[4px_4px_0_0_rgba(42,36,31,0.08)]">
              <h4 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
                Add New Content Block
              </h4>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {BLOCK_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleAddBlock(opt.type)}
                    className="flex flex-col items-start p-2.5 rounded-xl border border-[var(--foreground)]/40 bg-[var(--surface-soft)] text-left hover:border-[var(--foreground)] hover:bg-[var(--surface-strong)] transition-all"
                  >
                    <span className="font-bold text-xs text-[var(--foreground)]">{opt.label}</span>
                    <span className="text-[10px] text-[var(--foreground)]/60 leading-tight mt-0.5 truncate w-full">
                      {opt.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Block List inside section */}
            <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-5 space-y-3 shadow-[4px_4px_0_0_rgba(42,36,31,0.08)]">
              <h4 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
                Section Blocks ({currentSection.blocks.length})
              </h4>

              {currentSection.blocks.length === 0 ? (
                <p className="text-xs text-[var(--foreground)]/60 italic py-4 text-center">
                  No custom blocks added to this section yet. Click a block type above to add one!
                </p>
              ) : (
                <div className="space-y-2">
                  {currentSection.blocks.map((blk, bIdx) => {
                    const isSelected = blk.id === selectedBlockId;
                    return (
                      <div
                        key={blk.id}
                        onClick={() => setSelectedBlockId(blk.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[var(--foreground)] bg-[var(--surface-strong)] shadow-[3px_3px_0_0_rgba(42,36,31,0.8)]"
                            : "border-[var(--foreground)]/30 bg-[var(--surface-soft)] hover:border-[var(--foreground)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--foreground)]/10 text-xs font-black">
                            {bIdx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-xs text-[var(--foreground)] capitalize">
                              {blk.type.replace(/_/g, " ")} Block
                            </div>
                            <div className="text-[10px] text-[var(--foreground)]/60 truncate max-w-[180px]">
                              {blk.content.headingText ||
                                blk.content.paragraphText ||
                                blk.content.highlightTitle ||
                                blk.content.statValue ||
                                "Configured block"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(bIdx, "up")}
                            disabled={bIdx === 0}
                            className="p-1 text-[var(--foreground)] disabled:opacity-20"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveBlock(bIdx, "down")}
                            disabled={bIdx === currentSection.blocks.length - 1}
                            className="p-1 text-[var(--foreground)] disabled:opacity-20"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateBlock(blk.id)}
                            className="p-1 text-[var(--foreground)]"
                            title="Duplicate Block"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(blk.id)}
                            className="p-1 text-rose-600"
                            title="Delete Block"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Block Inspector & Live Editor */}
          <div className="space-y-6">
            {selectedBlock ? (
              <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-6 space-y-6 shadow-[4px_4px_0_0_rgba(42,36,31,0.08)]">
                <div className="flex items-center justify-between border-b-2 border-[var(--foreground)]/20 pb-4">
                  <div>
                    <span className="paper-chip text-[10px] uppercase font-bold tracking-wider">
                      Editing Block
                    </span>
                    <h3 className="text-xl font-black text-[var(--foreground)] capitalize mt-1">
                      {selectedBlock.type.replace(/_/g, " ")} Block
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(selectedBlock.id)}
                    className="paper-button !bg-rose-500/10 !border-rose-700 !text-rose-800 text-xs px-3 py-1.5"
                  >
                    Delete Block
                  </button>
                </div>

                {/* Specific Block Content Editors */}
                <div className="space-y-4">
                  {(selectedBlock.type === "heading" || selectedBlock.type === "paragraph" || selectedBlock.type === "rich_text") && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                          Text Content
                        </label>
                        {selectedBlock.type === "heading" ? (
                          <input
                            type="text"
                            value={selectedBlock.content.headingText || ""}
                            onChange={(e) =>
                              handleUpdateBlock(selectedBlock.id, {
                                content: { ...selectedBlock.content, headingText: e.target.value },
                              })
                            }
                            className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-4 py-2.5 font-bold text-sm"
                          />
                        ) : (
                          <textarea
                            rows={3}
                            value={selectedBlock.content.paragraphText || selectedBlock.content.text || ""}
                            onChange={(e) =>
                              handleUpdateBlock(selectedBlock.id, {
                                content: { ...selectedBlock.content, paragraphText: e.target.value },
                              })
                            }
                            className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] p-3 font-medium text-sm"
                          />
                        )}
                      </div>

                      {selectedBlock.type === "heading" && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                            Heading Level
                          </label>
                          <select
                            value={selectedBlock.content.headingLevel || "h3"}
                            onChange={(e) =>
                              handleUpdateBlock(selectedBlock.id, {
                                content: {
                                  ...selectedBlock.content,
                                  headingLevel: e.target.value as "h2" | "h3" | "h4",
                                },
                              })
                            }
                            className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-3 py-2 font-bold text-sm"
                          >
                            <option value="h2 font-black">H2 - Major Title</option>
                            <option value="h3 font-extrabold">H3 - Standard Subhead</option>
                            <option value="h4 font-bold">H4 - Minor Group Header</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {selectedBlock.type === "highlight_box" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                          Highlight Box Title
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content.highlightTitle || ""}
                          onChange={(e) =>
                            handleUpdateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, highlightTitle: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-4 py-2 font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80 mb-1">
                          Highlight Box Content
                        </label>
                        <textarea
                          rows={3}
                          value={selectedBlock.content.highlightText || ""}
                          onChange={(e) =>
                            handleUpdateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, highlightText: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] p-3 font-medium text-sm"
                        />
                      </div>
                    </>
                  )}

                  {(selectedBlock.type === "card_grid" || selectedBlock.type === "metric_grid") && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80">
                          Cards Collection ({selectedBlock.content.cards?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newCards: BlockCard[] = [
                              ...(selectedBlock.content.cards || []),
                              {
                                id: `crd-${Date.now()}`,
                                title: "New Card Title",
                                subtitle: "Subtitle",
                                description: "Card description text goes here.",
                                statValue: "95%",
                                visible: true,
                                order: (selectedBlock.content.cards?.length || 0) + 1,
                              },
                            ];
                            handleUpdateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, cards: newCards },
                            });
                          }}
                          className="paper-button text-xs px-2.5 py-1"
                        >
                          + Add Card
                        </button>
                      </div>

                      {(selectedBlock.content.cards || []).map((crd, idx) => (
                        <div key={crd.id} className="rounded-xl border border-[var(--foreground)]/40 p-3 bg-[var(--surface-soft)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">Card #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newCards = selectedBlock.content.cards!.filter((c) => c.id !== crd.id);
                                handleUpdateBlock(selectedBlock.id, {
                                  content: { ...selectedBlock.content, cards: newCards },
                                });
                              }}
                              className="text-xs text-rose-600 font-bold"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Card Title"
                            value={crd.title}
                            onChange={(e) => {
                              const updated = selectedBlock.content.cards!.map((c) => (c.id === crd.id ? { ...c, title: e.target.value } : c));
                              handleUpdateBlock(selectedBlock.id, { content: { ...selectedBlock.content, cards: updated } });
                            }}
                            className="w-full rounded-lg border border-[var(--foreground)]/30 p-2 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            placeholder="Card Description"
                            value={crd.description || ""}
                            onChange={(e) => {
                              const updated = selectedBlock.content.cards!.map((c) => (c.id === crd.id ? { ...c, description: e.target.value } : c));
                              handleUpdateBlock(selectedBlock.id, { content: { ...selectedBlock.content, cards: updated } });
                            }}
                            className="w-full rounded-lg border border-[var(--foreground)]/30 p-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBlock.type === "timeline_group" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80">
                          Journey Stage Items ({selectedBlock.content.timelineItems?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const items: BlockTimelineItem[] = [
                              ...(selectedBlock.content.timelineItems || []),
                              {
                                id: `time-${Date.now()}`,
                                stageNumber: `0${(selectedBlock.content.timelineItems?.length || 0) + 1}`,
                                stageTitle: "Stage Title",
                                institution: "Institution / Company",
                                period: "2024 - Present",
                                description: "Detailed description of achievements and learning outcomes.",
                                percentageOrStat: "Grade/Stat",
                                visible: true,
                                order: (selectedBlock.content.timelineItems?.length || 0) + 1,
                              },
                            ];
                            handleUpdateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, timelineItems: items },
                            });
                          }}
                          className="paper-button text-xs px-2.5 py-1"
                        >
                          + Add Journey Stage
                        </button>
                      </div>

                      {(selectedBlock.content.timelineItems || []).map((tItem, idx) => (
                        <div key={tItem.id} className="rounded-xl border border-[var(--foreground)]/40 p-3 bg-[var(--surface-soft)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">Stage #{idx + 1} ({tItem.stageTitle})</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = selectedBlock.content.timelineItems!.filter((t) => t.id !== tItem.id);
                                handleUpdateBlock(selectedBlock.id, {
                                  content: { ...selectedBlock.content, timelineItems: newItems },
                                });
                              }}
                              className="text-xs text-rose-600 font-bold"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Stage Title"
                              value={tItem.stageTitle}
                              onChange={(e) => {
                                const updated = selectedBlock.content.timelineItems!.map((t) => (t.id === tItem.id ? { ...t, stageTitle: e.target.value } : t));
                                handleUpdateBlock(selectedBlock.id, { content: { ...selectedBlock.content, timelineItems: updated } });
                              }}
                              className="rounded-lg border border-[var(--foreground)]/30 p-2 text-xs font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Institution / Org"
                              value={tItem.institution || ""}
                              onChange={(e) => {
                                const updated = selectedBlock.content.timelineItems!.map((t) => (t.id === tItem.id ? { ...t, institution: e.target.value } : t));
                                handleUpdateBlock(selectedBlock.id, { content: { ...selectedBlock.content, timelineItems: updated } });
                              }}
                              className="rounded-lg border border-[var(--foreground)]/30 p-2 text-xs font-bold"
                            />
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Stage Description"
                            value={tItem.description}
                            onChange={(e) => {
                              const updated = selectedBlock.content.timelineItems!.map((t) => (t.id === tItem.id ? { ...t, description: e.target.value } : t));
                              handleUpdateBlock(selectedBlock.id, { content: { ...selectedBlock.content, timelineItems: updated } });
                            }}
                            className="w-full rounded-lg border border-[var(--foreground)]/30 p-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Live Render Preview */}
                  <div className="pt-4 border-t-2 border-[var(--foreground)]/20">
                    <span className="block text-xs font-black uppercase tracking-wider text-[var(--foreground)] mb-2">
                      Live Production Block Preview
                    </span>
                    <div className="rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] p-4">
                      <BlockRegistry block={selectedBlock} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-8 text-center space-y-3 shadow-[4px_4px_0_0_rgba(42,36,31,0.08)]">
                <MousePointer className="h-8 w-8 mx-auto text-[var(--foreground)]/40" />
                <h4 className="text-base font-black text-[var(--foreground)]">Select a block to edit</h4>
                <p className="text-xs text-[var(--foreground)]/70 max-w-xs mx-auto">
                  Click any block in the left panel to edit its text, metrics, cards, timeline items, or layout presets.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NAVIGATION CONTROLS */}
      {activeSubTab === "navigation" && (
        <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface)] p-6 space-y-6 shadow-[4px_4px_0_0_rgba(42,36,31,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[var(--foreground)]">Public Navbar Configuration</h3>
              <p className="text-xs text-[var(--foreground)]/70">
                Configure which sections show in the main header navigation, edit custom link labels, and control display sequence.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const autoNavs: NavigationItemConfig[] = config.sections
                  .filter((s) => s.visible !== false)
                  .map((s, idx) => ({
                    sectionId: s.id,
                    visibleInNav: s.visibleInNav !== false,
                    navLabel: s.navLabel || s.publicDisplayTitle,
                    order: idx + 1,
                  }));
                setConfig({ ...config, navItems: autoNavs });
              }}
              className="paper-button text-xs px-3 py-1.5"
            >
              Sync with Active Sections
            </button>
          </div>

          <div className="space-y-3">
            {config.navItems.map((item, idx) => {
              const sec = config.sections.find((s) => s.id === item.sectionId);

              return (
                <div
                  key={item.sectionId}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--foreground)]/30 bg-[var(--surface-soft)] gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--foreground)]/40 bg-[var(--surface)] text-xs font-black">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-[var(--foreground)]">
                        {sec?.publicDisplayTitle || item.sectionId}
                      </div>
                      <div className="text-xs text-[var(--foreground)]/60 font-medium">
                        Target Anchor: #{item.sectionId === "hero" ? "home" : item.sectionId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={item.navLabel}
                      placeholder="Navbar Label"
                      onChange={(e) => {
                        const updated = config.navItems.map((n) => (n.sectionId === item.sectionId ? { ...n, navLabel: e.target.value } : n));
                        setConfig({ ...config, navItems: updated });
                      }}
                      className="rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface)] px-3 py-1.5 font-bold text-sm max-w-[160px]"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.navItems.map((n) => (n.sectionId === item.sectionId ? { ...n, visibleInNav: !n.visibleInNav } : n));
                        setConfig({ ...config, navItems: updated });
                      }}
                      className={`p-2 rounded-xl border-2 font-bold text-xs flex items-center gap-1 ${
                        item.visibleInNav
                          ? "border-emerald-700 bg-emerald-500/10 text-emerald-800"
                          : "border-rose-700 bg-rose-500/10 text-rose-800"
                      }`}
                    >
                      {item.visibleInNav ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>{item.visibleInNav ? "Visible" : "Hidden"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
          </div>

          {/* RIGHT PANEL: TRUE LIVE WEBSITE PREVIEW */}
          <div className="sticky top-20 space-y-3">
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-color,rgba(0,0,0,0.1))] text-xs font-bold shadow-sm">
              <span className="flex items-center gap-1.5 text-[var(--accent)]">
                <Sparkles className="w-4 h-4" />
                <span>Live Website Renderer Preview</span>
              </span>
              <span className="text-[var(--foreground)] opacity-60">
                Click any section to select for editing
              </span>
            </div>

            <LiveWebsitePreview
              homepageConfig={config}
              selectedSectionId={selectedSectionId}
              viewportMode={viewportMode}
              onSelectSection={(secId) => setSelectedSectionId(secId)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
