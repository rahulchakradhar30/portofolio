"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  Activity,
  RefreshCw,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type {
  PortfolioContent,
  UnifiedAnimationConfig,
  SupportedAnimationType,
  SupportedEasing,
  Project,
  Skill,
  Certification,
} from "@/app/lib/types";
import {
  DEFAULT_UNIFIED_ANIMATION_CONFIG,
  normalizeAnimationConfig,
  getResolvedAnimation,
} from "@/app/lib/animationResolver";
import { AdminCard, adminPrimaryButtonClassName, adminSubtleButtonClassName } from "@/app/components/AdminUIComponents";

const ANIMATION_TYPE_OPTIONS: { value: SupportedAnimationType; label: string }[] = [
  { value: "slide", label: "Slide Up & Fade In" },
  { value: "fade", label: "Pure Fade In" },
  { value: "scale", label: "Scale Zoom & Fade In" },
  { value: "reveal", label: "Scroll Reveal (Dramatic)" },
  { value: "stagger", label: "Staggered Children Reveal" },
  { value: "float", label: "Subtle Floating Animation" },
  { value: "rotate", label: "Rotational Entrance" },
];

const EASING_OPTIONS: { value: SupportedEasing; label: string }[] = [
  { value: "easeOut", label: "Smooth Ease Out (Standard)" },
  { value: "easeInOut", label: "Fluid Ease In-Out" },
  { value: "linear", label: "Linear Constant" },
  { value: "anticipate", label: "Anticipate Pop" },
];

const SECTIONS_LIST = [
  { id: "hero", label: "Hero Section" },
  { id: "about", label: "About Section" },
  { id: "roadmap", label: "Academic Roadmap" },
  { id: "radar", label: "Portfolio Radar" },
  { id: "skills", label: "Skills Grid" },
  { id: "projects", label: "Projects Showcase" },
  { id: "certifications", label: "Certifications Grid" },
  { id: "proofMode", label: "Proof Mode Visualizer" },
];

export default function AnimationsTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const [animConfig, setAnimConfig] = useState<UnifiedAnimationConfig>(DEFAULT_UNIFIED_ANIMATION_CONFIG);

  // Active Scope Controls
  const [activeScope, setActiveScope] = useState<"global" | "section" | "component">("global");
  const [selectedSection, setSelectedSection] = useState<string>("hero");
  const [selectedComponent, setSelectedComponent] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [res, projectsRes] = await Promise.all([
        adminAPI.getPortfolioContent(),
        adminAPI.getProjects(),
      ]);

      if (projectsRes.success && Array.isArray(projectsRes.projects)) {
        setProjects(projectsRes.projects);
        if (projectsRes.projects.length > 0) {
          setSelectedComponent(projectsRes.projects[0].id);
        }
      }

      if (res.success && res.content) {
        setContent(res.content);
        const norm = normalizeAnimationConfig(res.content.animationConfig || res.content);
        setAnimConfig(norm);
      }
    } catch (error) {
      console.error("Error loading animation settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...content,
        animationConfig: animConfig,
        // Sync legacy flags for backward compatibility
        animationsEnabled: animConfig.enabled,
        animationType: animConfig.global.type === "scale" ? "zoom" : (animConfig.global.type as "fade" | "slide" | "zoom"),
        animationDelay: animConfig.global.delay,
        scrollEffects: animConfig.global.scrollEffect,
      });

      if (res.success) {
        alert("Animation configuration saved and synchronized!");
      } else {
        alert("Failed to save animation settings: " + (res.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error saving animation configuration");
    } finally {
      setSaving(false);
    }
  };

  const replayPreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  // Resolved animation for the currently inspected scope
  const inspectedResolution = useMemo(() => {
    const secId = activeScope === "global" ? undefined : selectedSection;
    const compId = activeScope === "component" ? selectedComponent : undefined;
    return getResolvedAnimation(animConfig, secId, compId);
  }, [animConfig, activeScope, selectedSection, selectedComponent]);

  if (loading) {
    return <div className="text-center py-10 text-[var(--foreground)]/60">Loading Motion Controls...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="paper-card p-5 shadow-none md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]/70">
              <Sparkles className="h-3.5 w-3.5" />
              Motion Settings Studio
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--foreground)] md:text-3xl">
              Hierarchical Animation Controls
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/65 md:text-base">
              Configure animation behavior at the Global, Section, or Component level. Overrides take priority (Component → Section → Global → Safe Default).
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="paper-button-primary rounded-full px-6 py-3.5 text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {saving ? "Saving Changes..." : "Save Configuration"}
          </button>
        </div>
      </div>

      {/* Main Grid: Control Studio & Live Interactive Preview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Scope Selection & Hierarchical Parameters */}
        <div className="space-y-6 lg:col-span-2">
          {/* Global Master Toggle */}
          <div className="paper-card p-4 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-[var(--foreground)]">Enable Motion Engine</p>
              <p className="text-xs text-[var(--foreground)]/60">Toggle all Framer Motion visuals site-wide.</p>
            </div>
            <input
              type="checkbox"
              checked={animConfig.enabled}
              onChange={(e) => setAnimConfig({ ...animConfig, enabled: e.target.checked })}
              className="h-6 w-6 accent-[var(--accent)] cursor-pointer"
            />
          </div>

          {/* Scope Selector Tabs */}
          <div className="paper-card p-4">
            <div className="flex gap-2 border-b border-[var(--foreground)]/10 pb-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveScope("global")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activeScope === "global"
                    ? "bg-[var(--accent)] text-white shadow"
                    : "bg-[var(--surface-soft)] text-[var(--foreground)]/70 hover:bg-[var(--surface-strong)]"
                }`}
              >
                1. Global Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveScope("section")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activeScope === "section"
                    ? "bg-[var(--accent)] text-white shadow"
                    : "bg-[var(--surface-soft)] text-[var(--foreground)]/70 hover:bg-[var(--surface-strong)]"
                }`}
              >
                2. Section Override
              </button>
              <button
                type="button"
                onClick={() => setActiveScope("component")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  activeScope === "component"
                    ? "bg-[var(--accent)] text-white shadow"
                    : "bg-[var(--surface-soft)] text-[var(--foreground)]/70 hover:bg-[var(--surface-strong)]"
                }`}
              >
                3. Component Override
              </button>
            </div>

            {/* Sub-Selection Pickers */}
            {activeScope === "section" && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Select Target Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[var(--foreground)]/15 bg-[var(--surface)] p-3 text-xs font-semibold text-[var(--foreground)]"
                >
                  {SECTIONS_LIST.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeScope === "component" && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Select Component Item</label>
                <select
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[var(--foreground)]/15 bg-[var(--surface)] p-3 text-xs font-semibold text-[var(--foreground)]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Project: {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Parameter Timeline Sliders & Pickers */}
            <div className="space-y-4 pt-2">
              {/* Inheritance Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--foreground)]/70">Current Inheritance Priority:</span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                    inspectedResolution.inheritance === "component"
                      ? "border-purple-300 bg-purple-100 text-purple-800"
                      : inspectedResolution.inheritance === "section"
                      ? "border-blue-300 bg-blue-100 text-blue-800"
                      : "border-emerald-300 bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {inspectedResolution.inheritance === "component" && "Custom Component Override"}
                  {inspectedResolution.inheritance === "section" && "Section Level Override"}
                  {inspectedResolution.inheritance === "global" && "Inherited from Global"}
                  {inspectedResolution.inheritance === "default" && "Safe Built-in Default"}
                </span>
              </div>

              {/* Animation Type */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Animation Type</label>
                <select
                  value={inspectedResolution.params.type}
                  onChange={(e) => {
                    const newType = e.target.value as SupportedAnimationType;
                    if (activeScope === "global") {
                      setAnimConfig({
                        ...animConfig,
                        global: { ...animConfig.global, type: newType },
                      });
                    } else if (activeScope === "section") {
                      setAnimConfig({
                        ...animConfig,
                        sections: {
                          ...animConfig.sections,
                          [selectedSection]: { ...animConfig.sections?.[selectedSection], type: newType },
                        },
                      });
                    } else {
                      setAnimConfig({
                        ...animConfig,
                        components: {
                          ...animConfig.components,
                          [selectedComponent]: { ...animConfig.components?.[selectedComponent], type: newType },
                        },
                      });
                    }
                  }}
                  className="w-full rounded-2xl border-2 border-[var(--foreground)]/15 bg-[var(--surface)] p-3 text-xs font-semibold text-[var(--foreground)]"
                >
                  {ANIMATION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeline Sliders: Duration */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[var(--foreground)] mb-1">
                  <span>Duration (Seconds)</span>
                  <span className="font-mono text-[var(--accent)]">{inspectedResolution.params.duration.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={inspectedResolution.params.duration}
                  onChange={(e) => {
                    const dur = Number(e.target.value);
                    if (activeScope === "global") {
                      setAnimConfig({
                        ...animConfig,
                        global: { ...animConfig.global, duration: dur },
                      });
                    } else if (activeScope === "section") {
                      setAnimConfig({
                        ...animConfig,
                        sections: {
                          ...animConfig.sections,
                          [selectedSection]: { ...animConfig.sections?.[selectedSection], duration: dur },
                        },
                      });
                    } else {
                      setAnimConfig({
                        ...animConfig,
                        components: {
                          ...animConfig.components,
                          [selectedComponent]: { ...animConfig.components?.[selectedComponent], duration: dur },
                        },
                      });
                    }
                  }}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              {/* Timeline Sliders: Delay */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[var(--foreground)] mb-1">
                  <span>Delay (Seconds)</span>
                  <span className="font-mono text-[var(--accent)]">{inspectedResolution.params.delay.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={inspectedResolution.params.delay}
                  onChange={(e) => {
                    const del = Number(e.target.value);
                    if (activeScope === "global") {
                      setAnimConfig({
                        ...animConfig,
                        global: { ...animConfig.global, delay: del },
                      });
                    } else if (activeScope === "section") {
                      setAnimConfig({
                        ...animConfig,
                        sections: {
                          ...animConfig.sections,
                          [selectedSection]: { ...animConfig.sections?.[selectedSection], delay: del },
                        },
                      });
                    } else {
                      setAnimConfig({
                        ...animConfig,
                        components: {
                          ...animConfig.components,
                          [selectedComponent]: { ...animConfig.components?.[selectedComponent], delay: del },
                        },
                      });
                    }
                  }}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              {/* Easing Options */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Easing Curve</label>
                <select
                  value={inspectedResolution.params.easing || "easeOut"}
                  onChange={(e) => {
                    const ease = e.target.value as SupportedEasing;
                    if (activeScope === "global") {
                      setAnimConfig({
                        ...animConfig,
                        global: { ...animConfig.global, easing: ease },
                      });
                    } else if (activeScope === "section") {
                      setAnimConfig({
                        ...animConfig,
                        sections: {
                          ...animConfig.sections,
                          [selectedSection]: { ...animConfig.sections?.[selectedSection], easing: ease },
                        },
                      });
                    } else {
                      setAnimConfig({
                        ...animConfig,
                        components: {
                          ...animConfig.components,
                          [selectedComponent]: { ...animConfig.components?.[selectedComponent], easing: ease },
                        },
                      });
                    }
                  }}
                  className="w-full rounded-2xl border-2 border-[var(--foreground)]/15 bg-[var(--surface)] p-3 text-xs font-semibold text-[var(--foreground)]"
                >
                  {EASING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Motion Studio Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[var(--foreground)] flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[var(--accent)]" /> Live Motion Preview
            </h3>
            <button
              type="button"
              onClick={replayPreview}
              className="px-3 py-1 rounded-full text-xs font-bold border border-[var(--foreground)]/20 hover:bg-[var(--surface-soft)] flex items-center gap-1"
            >
              <Play className="h-3 w-3" /> Replay
            </button>
          </div>

          <div className="paper-card p-6 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden bg-[var(--surface)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${inspectedResolution.params.type}-${inspectedResolution.params.duration}-${inspectedResolution.params.delay}-${inspectedResolution.params.easing}-${previewKey}`}
                initial={inspectedResolution.variants.initial}
                animate={inspectedResolution.variants.animate}
                transition={inspectedResolution.variants.transition}
                className="paper-card p-6 border-2 border-[var(--foreground)] bg-[var(--surface-soft)] shadow-md w-full text-center space-y-3"
              >
                <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-black shadow">
                  RC
                </div>
                <h4 className="font-extrabold text-sm text-[var(--foreground)]">
                  Preview Element: {inspectedResolution.params.type.toUpperCase()}
                </h4>
                <p className="text-xs text-[var(--foreground)]/70">
                  Duration: {inspectedResolution.params.duration}s | Delay: {inspectedResolution.params.delay}s
                </p>
                <div className="pt-2">
                  <span className="inline-block rounded-full bg-[var(--foreground)] text-white px-3 py-1 text-[10px] font-bold">
                    Homepage Framer Motion Engine
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
