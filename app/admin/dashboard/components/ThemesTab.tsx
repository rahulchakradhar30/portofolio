"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { PortfolioContent, ThemeConfigItem, UnifiedThemeConfig } from "@/app/lib/types";
import {
  PERMANENT_DEFAULT_THEME,
  MAX_CUSTOM_THEMES,
  normalizeThemeConfig,
  applyThemeTokensToDOM,
} from "@/app/lib/themeResolver";
import { applyGlassTokensToDOM } from "@/app/lib/glassResolver";
import { LocalInput } from "@/app/components/LocalInput";
import { AdminCard, adminPrimaryButtonClassName, adminSubtleButtonClassName } from "@/app/components/AdminUIComponents";

export default function ThemesTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeConfig, setThemeConfig] = useState<UnifiedThemeConfig>({
    activeThemeId: PERMANENT_DEFAULT_THEME.id,
    customThemes: [],
  });

  const [editingTheme, setEditingTheme] = useState<ThemeConfigItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await adminAPI.getPortfolioContent();
      if (res.success && res.content) {
        setContent(res.content);
        const norm = normalizeThemeConfig(res.content.themeConfig);
        setThemeConfig(norm);
      }
    } catch (error) {
      console.error("Error loading theme settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    const nextConfig: UnifiedThemeConfig = {
      ...themeConfig,
      activeThemeId: themeId,
    };
    setThemeConfig(nextConfig);

    const activeItem =
      themeId === PERMANENT_DEFAULT_THEME.id
        ? PERMANENT_DEFAULT_THEME
        : nextConfig.customThemes.find((t) => t.id === themeId) || PERMANENT_DEFAULT_THEME;

    applyThemeTokensToDOM(activeItem.tokens);
    applyGlassTokensToDOM(activeItem.tokens, content?.glassConfig || content);

    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...content,
        themeConfig: nextConfig,
      });
      if (!res.success) {
        alert("Failed to activate theme on server");
      }
    } catch (err) {
      console.error("Error activating theme:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveThemeForm = async () => {
    if (!editingTheme) return;
    if (!editingTheme.name.trim()) {
      alert("Theme name is required");
      return;
    }

    let updatedCustom = [...themeConfig.customThemes];
    if (isCreating) {
      if (updatedCustom.length >= MAX_CUSTOM_THEMES) {
        alert(`Maximum of ${MAX_CUSTOM_THEMES} custom themes allowed.`);
        return;
      }
      updatedCustom.push(editingTheme);
    } else {
      updatedCustom = updatedCustom.map((t) => (t.id === editingTheme.id ? editingTheme : t));
    }

    const nextConfig: UnifiedThemeConfig = {
      ...themeConfig,
      activeThemeId: editingTheme.id,
      customThemes: updatedCustom,
    };

    setThemeConfig(nextConfig);
    setEditingTheme(null);
    setIsCreating(false);

    applyThemeTokensToDOM(editingTheme.tokens);
    applyGlassTokensToDOM(editingTheme.tokens, content?.glassConfig || content);

    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...content,
        themeConfig: nextConfig,
      });
      if (res.success) {
        alert("Theme saved and activated successfully!");
      } else {
        alert("Failed to save theme changes");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      alert("Error saving theme");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (themeId === PERMANENT_DEFAULT_THEME.id) {
      alert("Permanent default theme cannot be deleted.");
      return;
    }

    if (!confirm("Are you sure you want to delete this custom theme?")) return;

    const updatedCustom = themeConfig.customThemes.filter((t) => t.id !== themeId);
    const nextActive =
      themeConfig.activeThemeId === themeId ? PERMANENT_DEFAULT_THEME.id : themeConfig.activeThemeId;

    const nextConfig: UnifiedThemeConfig = {
      activeThemeId: nextActive,
      customThemes: updatedCustom,
    };

    setThemeConfig(nextConfig);

    const activeItem =
      nextActive === PERMANENT_DEFAULT_THEME.id
        ? PERMANENT_DEFAULT_THEME
        : updatedCustom.find((t) => t.id === nextActive) || PERMANENT_DEFAULT_THEME;
    applyThemeTokensToDOM(activeItem.tokens);

    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...content,
        themeConfig: nextConfig,
      });
      if (res.success) {
        alert("Theme deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting theme:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleThemeMode = async (mode: "paper" | "spatial") => {
    const nextConfig: UnifiedThemeConfig = {
      ...themeConfig,
      themeMode: mode,
    };
    setThemeConfig(nextConfig);
    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...content,
        themeConfig: nextConfig,
      });
      if (!res.success) {
        alert("Failed to update visual theme mode on server");
      }
    } catch (err) {
      console.error("Error updating theme mode:", err);
    } finally {
      setSaving(false);
    }
  };

  const startCreateTheme = () => {
    if (themeConfig.customThemes.length >= MAX_CUSTOM_THEMES) {
      alert(`Maximum of ${MAX_CUSTOM_THEMES} custom themes reached.`);
      return;
    }
    const newId = `theme-${Date.now()}`;
    const newTheme: ThemeConfigItem = {
      id: newId,
      name: `Custom Theme ${themeConfig.customThemes.length + 1}`,
      isPermanent: false,
      tokens: { ...PERMANENT_DEFAULT_THEME.tokens, accent: "#3b82f6", accentStrong: "#2563eb" },
    };
    setEditingTheme(newTheme);
    setIsCreating(true);
  };

  if (loading) {
    return <div className="text-center py-10 text-[var(--foreground)]/60">Loading Color & Visual Themes...</div>;
  }

  const allThemes = [PERMANENT_DEFAULT_THEME, ...themeConfig.customThemes];
  const activeTheme = allThemes.find((t) => t.id === themeConfig.activeThemeId) || PERMANENT_DEFAULT_THEME;
  const currentPreviewTokens = editingTheme ? editingTheme.tokens : activeTheme.tokens;
  const currentThemeMode = themeConfig.themeMode || "paper";

  return (
    <div className="space-y-6">
      {/* Visual Layout Mode Selector */}
      <div className="paper-card p-5 md:p-6 border-2 border-[var(--accent)]/40 bg-[var(--surface-soft)]/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Visual Experience Architecture
            </div>
            <h3 className="text-xl font-black text-[var(--foreground)] mt-1">
              Select Portfolio Theme Architecture
            </h3>
            <p className="text-xs md:text-sm text-[var(--foreground)]/70 mt-1 max-w-xl">
              Switch between Theme 01 (Editorial Paper Layout) and Theme 02 (Immersive Portfolio Room). Admin content and database remain 100% identical.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[var(--surface)] p-1.5 rounded-xl border border-[var(--border-thin)] shadow-sm">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleToggleThemeMode("paper")}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                currentThemeMode === "paper"
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm font-extrabold"
                  : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
              }`}
            >
              THEME 01 — PAPER
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleToggleThemeMode("spatial")}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                currentThemeMode === "spatial"
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm font-extrabold"
                  : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
              }`}
            >
              THEME 02 — IMMERSIVE ROOM
            </button>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="paper-card p-5 shadow-none md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]/70">
              <Palette className="h-3.5 w-3.5" />
              Color Palette Studio
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--foreground)] md:text-3xl">
              Palette & Accent Tokens
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/65 md:text-base">
              Customize design tokens for background, text, surface, accents, and highlights. Both Theme 01 and Theme 02 dynamically reflect your active color tokens.
            </p>
          </div>
          <button
            type="button"
            disabled={saving || themeConfig.customThemes.length >= MAX_CUSTOM_THEMES}
            onClick={startCreateTheme}
            className="paper-button-primary rounded-full px-6 py-3.5 text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Custom Theme ({themeConfig.customThemes.length}/{MAX_CUSTOM_THEMES})
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Theme List */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-lg font-black text-[var(--foreground)] flex items-center gap-2">
            Available Color Themes
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {allThemes.map((theme) => {
              const isActive = theme.id === themeConfig.activeThemeId;
              return (
                <motion.div
                  key={theme.id}
                  whileHover={{ y: -2 }}
                  className={`paper-card p-5 transition-all ${
                    isActive ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[var(--foreground)]">{theme.name}</h4>
                      {theme.isPermanent && (
                        <span className="rounded-full bg-[var(--surface-strong)] px-2 py-0.5 text-[10px] font-bold text-[var(--foreground)]/70">
                          Permanent
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <span className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    )}
                  </div>

                  {/* Swatches */}
                  <div className="flex gap-2 my-4">
                    <div
                      className="h-8 w-8 rounded-full border-2 border-black/10 shadow-sm"
                      style={{ backgroundColor: theme.tokens.background }}
                      title="Background"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-black/10 shadow-sm"
                      style={{ backgroundColor: theme.tokens.surface }}
                      title="Surface"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-black/10 shadow-sm"
                      style={{ backgroundColor: theme.tokens.foreground }}
                      title="Foreground Text"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-black/10 shadow-sm"
                      style={{ backgroundColor: theme.tokens.accent }}
                      title="Accent"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[var(--foreground)]/10">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => handleActivateTheme(theme.id)}
                        disabled={saving}
                        className={adminSubtleButtonClassName}
                      >
                        Activate Theme
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[var(--foreground)]/60">Currently Active</span>
                    )}

                    {!theme.isPermanent && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTheme(theme);
                            setIsCreating(false);
                          }}
                          className="p-2 rounded-full border border-[var(--foreground)]/15 hover:bg-[var(--surface-soft)] text-[var(--foreground)]"
                          title="Edit Theme"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="p-2 rounded-full border border-red-200 hover:bg-red-50 text-red-600"
                          title="Delete Theme"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Live Preview Side Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-[var(--foreground)] flex items-center gap-2">
            Live Design Token Preview
          </h3>
          <div
            className="rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 space-y-4"
            style={{
              backgroundColor: currentPreviewTokens.background,
              color: currentPreviewTokens.foreground,
              borderColor: currentPreviewTokens.foreground,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider opacity-70">
                {editingTheme ? `Editing: ${editingTheme.name}` : `Active: ${activeTheme.name}`}
              </span>
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: currentPreviewTokens.accent }}
              />
            </div>

            <div
              className="rounded-xl border-2 p-4 space-y-2 shadow-sm"
              style={{
                backgroundColor: currentPreviewTokens.surface,
                borderColor: currentPreviewTokens.foreground,
              }}
            >
              <h4 className="font-extrabold text-base" style={{ color: currentPreviewTokens.foreground }}>
                Paper Card Component
              </h4>
              <p className="text-xs opacity-80 leading-relaxed">
                This live card demonstrates surface colors, typography, borders, and button accents.
              </p>
              <div className="flex gap-2 pt-2">
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                  style={{
                    backgroundColor: currentPreviewTokens.surfaceSoft,
                    borderColor: currentPreviewTokens.foreground,
                    color: currentPreviewTokens.foreground,
                  }}
                >
                  Paper Chip
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full text-[11px] font-bold text-white shadow"
                  style={{ backgroundColor: currentPreviewTokens.accent }}
                >
                  Primary CTA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal / Panel */}
      {editingTheme && (
        <AdminCard
          title={isCreating ? "Create New Custom Theme" : `Edit Theme: ${editingTheme.name}`}
          description="Adjust design tokens below. Changes reflect immediately in the live preview."
          actions={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingTheme(null)}
                className={adminSubtleButtonClassName}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveThemeForm}
                disabled={saving}
                className={adminPrimaryButtonClassName}
              >
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save Theme"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <LocalInput
              label="Theme Name"
              value={editingTheme.name}
              onChange={(val) => setEditingTheme({ ...editingTheme, name: val })}
              required={true}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-bold mb-1">Paper Background</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editingTheme.tokens.background}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, background: e.target.value },
                      })
                    }
                    className="h-10 w-12 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingTheme.tokens.background}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, background: e.target.value },
                      })
                    }
                    className="w-full text-xs font-mono p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Card Surface</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editingTheme.tokens.surface}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, surface: e.target.value },
                      })
                    }
                    className="h-10 w-12 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingTheme.tokens.surface}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, surface: e.target.value },
                      })
                    }
                    className="w-full text-xs font-mono p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Foreground Text</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editingTheme.tokens.foreground}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, foreground: e.target.value, dotPattern: e.target.value },
                      })
                    }
                    className="h-10 w-12 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingTheme.tokens.foreground}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, foreground: e.target.value, dotPattern: e.target.value },
                      })
                    }
                    className="w-full text-xs font-mono p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editingTheme.tokens.accent}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, accent: e.target.value, accentStrong: e.target.value },
                      })
                    }
                    className="h-10 w-12 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingTheme.tokens.accent}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, accent: e.target.value, accentStrong: e.target.value },
                      })
                    }
                    className="w-full text-xs font-mono p-2 border rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
