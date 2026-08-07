"use client";

import { useState, useEffect } from "react";
import { Film, Play, ToggleLeft, RefreshCw, Upload, Sparkles, X } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { PortfolioContent } from "@/app/lib/types";
import Image from "next/image";

export default function IntroTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    introEnabled: true,
    introFirstLoadOnly: true,
    introBrandText: "",
    introSubtitle: "",
    introDuration: 3.5,
    introLogoUrl: "",
    introAccentColor: "",
    introEnableLogoAnimation: true,
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await adminAPI.getPortfolioContent();
      if (res.success && res.content) {
        setContent(res.content);
        setFormData({
          introEnabled: res.content.introEnabled !== false,
          introFirstLoadOnly: res.content.introFirstLoadOnly !== false,
          introBrandText: res.content.introBrandText || "",
          introSubtitle: res.content.introSubtitle || "",
          introDuration: Number(res.content.introDuration) || 3.5,
          introLogoUrl: res.content.introLogoUrl || "",
          introAccentColor: res.content.introAccentColor || "",
          introEnableLogoAnimation: res.content.introEnableLogoAnimation !== false,
        });
      }
    } catch (error) {
      console.error("Error loading intro configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...content,
        ...formData,
      });
      if (res.success) {
        alert("Intro configurations updated successfully!");
        loadContent();
      } else {
        alert("Failed to save intro settings: " + (res.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error saving settings: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await adminAPI.uploadToCloudinary(file);
      if (res.success && res.imageUrl) {
        setFormData(prev => ({ ...prev, introLogoUrl: res.imageUrl }));
      } else {
        alert("Failed to upload image: " + res.error);
      }
    } catch (error) {
      alert("Error uploading image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = () => {
    // Temporarily clear the sessionStorage flag and reload the page
    sessionStorage.removeItem("introPlayed");
    window.open("/", "_blank");
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading intro configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="paper-card p-5 shadow-none md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]/70">
              <Film className="h-3.5 w-3.5" />
              Cinematic Experience
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--foreground)] md:text-3xl">Intro Configuration</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/65 md:text-base">
              Customize the premium cinematic introduction that visitors see when they first arrive at your portfolio.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="paper-button rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              <Play className="mr-2 inline-block h-4 w-4" />
              Preview Live
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="paper-button-primary rounded-full px-6 py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? <RefreshCw className="mr-2 inline-block h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving Changes..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Toggle States */}
        <div className="paper-card space-y-5 p-5 shadow-none md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
            <ToggleLeft className="h-5 w-5 text-[var(--accent)]" /> Playback Controls
          </h3>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] p-4 hover:bg-[var(--surface)] transition">
            <div>
              <p className="text-sm font-bold text-gray-800">Enable Intro Overlay</p>
              <p className="text-xs text-gray-500">Master toggle for the entire cinematic intro feature.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.introEnabled}
              onChange={(e) => setFormData({ ...formData, introEnabled: e.target.checked })}
              className="h-5 w-5 accent-[var(--accent)]"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] p-4 hover:bg-[var(--surface)] transition">
            <div>
              <p className="text-sm font-bold text-gray-800">Play Once Per Session</p>
              <p className="text-xs text-gray-500">If disabled, the intro will play on every page refresh.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.introFirstLoadOnly}
              onChange={(e) => setFormData({ ...formData, introFirstLoadOnly: e.target.checked })}
              className="h-5 w-5 accent-[var(--accent)]"
            />
          </label>
          
          <div className="pt-4 border-t-2 border-[var(--foreground)]/10">
            <label className="block text-sm font-bold text-[var(--foreground)] mb-1">
              Animation Duration (Seconds)
            </label>
            <p className="text-xs text-gray-500 mb-3">Total length before revealing the homepage.</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={formData.introDuration}
                onChange={(e) => setFormData({ ...formData, introDuration: Number(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <span className="text-sm font-bold w-12 text-center bg-[var(--surface-soft)] py-1 rounded-md border-2 border-[var(--foreground)]/10">{formData.introDuration}s</span>
            </div>
          </div>
        </div>

        {/* Branding Configuration */}
        <div className="paper-card space-y-5 p-5 shadow-none md:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" /> Brand Presentation
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Brand Text</label>
            <p className="text-xs text-gray-500 mb-2">The main typography revealed in Step 1. Defaults to Site Title if blank.</p>
            <input
              type="text"
              value={formData.introBrandText}
              onChange={(e) => setFormData({ ...formData, introBrandText: e.target.value })}
              placeholder="e.g. Rahul Chakradhar"
              className="w-full rounded-xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Subtitle (Optional)</label>
            <input
              type="text"
              value={formData.introSubtitle}
              onChange={(e) => setFormData({ ...formData, introSubtitle: e.target.value })}
              placeholder="e.g. PORTFOLIO 2026"
              className="w-full rounded-xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-1">Text Accent Color (Optional)</label>
            <p className="text-xs text-gray-500 mb-2">Override the default typography color. Use valid CSS values.</p>
            <div className="flex gap-3">
              <input
                type="color"
                value={formData.introAccentColor || "#38bdf8"}
                onChange={(e) => setFormData({ ...formData, introAccentColor: e.target.value })}
                className="h-11 w-11 rounded-xl cursor-pointer bg-transparent border-0 p-0"
              />
              <input
                type="text"
                value={formData.introAccentColor}
                onChange={(e) => setFormData({ ...formData, introAccentColor: e.target.value })}
                placeholder="e.g. #38bdf8 or var(--accent)"
                className="flex-1 rounded-xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] px-4 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-[var(--foreground)]">Transformation Logo</label>
              <label className="flex cursor-pointer items-center gap-2">
                <span className="text-xs font-semibold text-[var(--foreground)]/70">Enable Animation</span>
                <input
                  type="checkbox"
                  checked={formData.introEnableLogoAnimation}
                  onChange={(e) => setFormData({ ...formData, introEnableLogoAnimation: e.target.checked })}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
              </label>
            </div>
            <div className="flex items-start gap-4">
              <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--foreground)]/10 bg-[var(--surface-soft)] overflow-hidden">
                {formData.introLogoUrl ? (
                  <>
                    <Image
                      src={formData.introLogoUrl}
                      alt="Intro Logo"
                      fill
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, introLogoUrl: "" })}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-80 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">No Logo</span>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-xs text-gray-500 leading-relaxed">
                  The brand text will morph into this logo during Step 2 of the animation sequence. Defaults to the main profile image if empty.
                </p>
                <div className="relative mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />
                  <div className="paper-button flex w-full items-center justify-center px-4 py-2 text-xs font-bold pointer-events-none">
                    {uploading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
