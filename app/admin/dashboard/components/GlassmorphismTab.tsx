"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Save, Layers, CheckCircle2 } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type {
  PortfolioContent,
  UnifiedGlassConfig,
  GlassPreset,
  GlassParams,
} from "@/app/lib/types";
import {
  GLASS_PRESETS,
  DEFAULT_UNIFIED_GLASS_CONFIG,
  normalizeGlassConfig,
  applyGlassTokensToDOM,
} from "@/app/lib/glassResolver";
import { getActiveTheme } from "@/app/lib/themeResolver";
import { AdminCard } from "@/app/components/AdminUIComponents";

export default function GlassmorphismTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [glassConfig, setGlassConfig] = useState<UnifiedGlassConfig>(DEFAULT_UNIFIED_GLASS_CONFIG);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await adminAPI.getPortfolioContent();
      if (res.success && res.content) {
        setContent(res.content);
        const norm = normalizeGlassConfig(res.content.glassConfig);
        setGlassConfig(norm);
        
        // Immediately sync DOM
        const activeTheme = getActiveTheme(res.content.themeConfig || res.content);
        applyGlassTokensToDOM(activeTheme.tokens, norm);
      }
    } catch (error) {
      console.error("Error loading glass settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = (next: UnifiedGlassConfig) => {
    setGlassConfig(next);
    if (content) {
      const activeTheme = getActiveTheme(content.themeConfig || content);
      applyGlassTokensToDOM(activeTheme.tokens, next);
    }
  };

  const handleMasterToggle = (enabled: boolean) => {
    handleUpdateConfig({
      ...glassConfig,
      enabled,
    });
  };

  const handleSelectPreset = (preset: GlassPreset) => {
    if (preset === "custom") {
      handleUpdateConfig({ ...glassConfig, preset: "custom" });
      return;
    }

    const presetParams = GLASS_PRESETS[preset];
    handleUpdateConfig({
      ...glassConfig,
      preset,
      global: { ...presetParams },
    });
  };

  const handleParamChange = (field: keyof GlassParams, value: number) => {
    const updatedGlobal: GlassParams = {
      ...glassConfig.global,
      [field]: value,
    };

    handleUpdateConfig({
      ...glassConfig,
      preset: "custom",
      global: updatedGlobal,
    });
  };

  const handleSectionOverrideToggle = (sectionKey: string, enabled?: boolean) => {
    const updatedSections = { ...(glassConfig.sections || {}) };
    if (enabled === undefined) {
      delete updatedSections[sectionKey];
    } else {
      updatedSections[sectionKey] = {
        ...updatedSections[sectionKey],
        enabled,
      };
    }

    handleUpdateConfig({
      ...glassConfig,
      sections: updatedSections,
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...content,
        glassConfig,
      });

      if (res.success) {
        alert("Glassmorphism configuration saved successfully!");
      } else {
        alert("Failed to save glass settings to server");
      }
    } catch (err) {
      console.error("Error saving glass settings:", err);
      alert("Error saving glass settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-[var(--foreground)]/60">Loading Glassmorphism Settings...</div>;
  }

  const activeTheme = getActiveTheme(content?.themeConfig || content);
  const registeredSections = [
    { id: "header", label: "Navbar / Header" },
    { id: "hero", label: "Hero Showcase" },
    { id: "projects", label: "Projects Showcase" },
    { id: "certifications", label: "Certifications Grid" },
    { id: "skills", label: "Skills Radar & Grid" },
    { id: "proofMode", label: "Proof Mode & Cards" },
    { id: "about", label: "About Editorial Cards" },
    { id: "contact", label: "Contact Form Container" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="paper-card p-5 shadow-none md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]/70">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Design Layer Extension
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--foreground)] md:text-3xl">
              Configurable Glassmorphism
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/65 md:text-base">
              Overlay an admin-controlled glass surface layer over the Paper Layout foundation. Automatically derives translucent tint, highlights, and borders from active theme colors.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveSettings}
            className="paper-button-primary rounded-full px-6 py-3.5 text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Glass Settings"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Controls Panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Master Toggle */}
          <AdminCard
            title="Master Glass Switch"
            description="When OFF, the website returns to the classic solid Paper Layout."
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-soft)] border-2 border-[var(--foreground)]/10">
              <div>
                <span className="font-extrabold text-base block text-[var(--foreground)]">
                  Enable Glassmorphism Layer
                </span>
                <span className="text-xs text-[var(--foreground)]/60">
                  {glassConfig.enabled ? "Glass layer is active across registered components" : "Paper Layout is standard (Glass OFF)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleMasterToggle(!glassConfig.enabled)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  glassConfig.enabled ? "bg-[var(--accent)]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    glassConfig.enabled ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </AdminCard>

          {/* Presets */}
          {glassConfig.enabled && (
            <AdminCard
              title="Glass Presets"
              description="Choose a fine-tuned preset or customize parameters below."
            >
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { id: "subtle", name: "Paper Glass", desc: "Subtle translucent paper tint" },
                  { id: "balanced", name: "Soft Glass", desc: "Balanced frosted blur" },
                  { id: "strong", name: "Deep Glass", desc: "Strong high-end depth" },
                  { id: "custom", name: "Custom Studio", desc: "Fine-tune sliders below" },
                ].map((p) => {
                  const isSelected = glassConfig.preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id as GlassPreset)}
                      className={`p-4 text-left rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--surface)] ring-2 ring-[var(--accent)]/30 font-bold"
                          : "border-[var(--foreground)]/15 bg-[var(--surface-soft)] hover:border-[var(--foreground)]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold">{p.name}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />}
                      </div>
                      <p className="mt-1 text-xs opacity-70 font-normal">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </AdminCard>
          )}

          {/* Fine Tuning Sliders */}
          {glassConfig.enabled && (
            <AdminCard
              title="Fine-Tuning Controls"
              description="Adjust glass depth, blur, border strength, contrast, and surface transparency."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Backdrop Blur */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Backdrop Blur</span>
                    <span className="font-mono text-[var(--accent)]">{glassConfig.global.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="24"
                    step="1"
                    value={glassConfig.global.blur}
                    onChange={(e) => handleParamChange("blur", parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Transparency / Opacity */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Surface Alpha (Transparency)</span>
                    <span className="font-mono text-[var(--accent)]">
                      {Math.round(glassConfig.global.transparency * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={glassConfig.global.transparency}
                    onChange={(e) => handleParamChange("transparency", parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Glass Intensity */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Glass Intensity</span>
                    <span className="font-mono text-[var(--accent)]">
                      {Math.round(glassConfig.global.intensity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={glassConfig.global.intensity}
                    onChange={(e) => handleParamChange("intensity", parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Border Strength */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Border Strength</span>
                    <span className="font-mono text-[var(--accent)]">
                      {Math.round(glassConfig.global.borderStrength * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={glassConfig.global.borderStrength}
                    onChange={(e) => handleParamChange("borderStrength", parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Surface Contrast */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Surface Highlight Contrast</span>
                    <span className="font-mono text-[var(--accent)]">
                      {Math.round(glassConfig.global.surfaceContrast * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={glassConfig.global.surfaceContrast}
                    onChange={(e) => handleParamChange("surfaceContrast", parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Shadow Depth */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Shadow Elevation Depth</span>
                    <span className="font-mono text-[var(--accent)]">
                      {Math.round(glassConfig.global.shadowDepth * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={glassConfig.global.shadowDepth}
                    onChange={(e) => handleParamChange("shadowDepth", parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>
              </div>
            </AdminCard>
          )}

          {/* Section Overrides */}
          {glassConfig.enabled && (
            <AdminCard
              title="Registered Component & Section Overrides"
              description="Control glass surface treatment per website section."
            >
              <div className="space-y-3">
                {registeredSections.map((sec) => {
                  const state = glassConfig.sections?.[sec.id]?.enabled;
                  return (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--foreground)]/10 bg-[var(--surface-soft)]"
                    >
                      <span className="font-bold text-sm text-[var(--foreground)]">{sec.label}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSectionOverrideToggle(sec.id, undefined)}
                          className={`px-3 py-1 text-xs rounded-full font-bold border ${
                            state === undefined
                              ? "bg-[var(--foreground)] text-[var(--surface)] border-[var(--foreground)]"
                              : "bg-transparent text-[var(--foreground)]/60 border-[var(--foreground)]/20"
                          }`}
                        >
                          Inherit Global
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSectionOverrideToggle(sec.id, true)}
                          className={`px-3 py-1 text-xs rounded-full font-bold border ${
                            state === true
                              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                              : "bg-transparent text-[var(--foreground)]/60 border-[var(--foreground)]/20"
                          }`}
                        >
                          ON
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSectionOverrideToggle(sec.id, false)}
                          className={`px-3 py-1 text-xs rounded-full font-bold border ${
                            state === false
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-transparent text-[var(--foreground)]/60 border-[var(--foreground)]/20"
                          }`}
                        >
                          OFF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          )}
        </div>

        {/* Live Admin Preview Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-[var(--foreground)] flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--accent)]" />
            Live Glass Preview
          </h3>

          <div className="sticky top-20 rounded-2xl border-2 border-[var(--foreground)] p-6 shadow-xl space-y-6 transition-all duration-300 bg-[var(--background)]">
            <div className="flex items-center justify-between border-b pb-3 border-[var(--foreground)]/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                  Active Theme
                </span>
                <p className="font-extrabold text-sm text-[var(--foreground)]">{activeTheme.name}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[var(--surface-soft)] border border-[var(--foreground)]/20">
                Mode: {glassConfig.enabled ? glassConfig.preset.toUpperCase() : "OFF (PAPER)"}
              </span>
            </div>

            {/* Simulated Glass Card */}
            <div className="glass-surface-force rounded-2xl p-6 space-y-4 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--accent)]">
                  Live Glass Surface
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
              </div>

              <div>
                <h4 className="text-xl font-black text-[var(--foreground)]">Theme-Adaptive Glass Surface</h4>
                <p className="text-xs font-medium mt-1 leading-relaxed opacity-85 text-[var(--foreground)]">
                  Notice how background opacity, border thickness, highlight inset, and backdrop blur dynamically reflect your slider settings and theme colors.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-soft)] border border-[var(--foreground)] text-[var(--foreground)]">
                  Paper Chip
                </span>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white shadow bg-[var(--accent)]"
                >
                  Primary CTA
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--foreground)]/15 bg-[var(--surface-soft)] text-xs space-y-2">
              <span className="font-extrabold block text-[var(--foreground)]">Resolved Token Values</span>
              <div className="font-mono text-[11px] space-y-1 opacity-80">
                <div>--glass-enabled: {glassConfig.enabled ? "1" : "0"}</div>
                <div>--glass-blur: {glassConfig.global.blur}px</div>
                <div>--glass-transparency: {Math.round(glassConfig.global.transparency * 100)}%</div>
                <div>--glass-border-strength: {Math.round(glassConfig.global.borderStrength * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
