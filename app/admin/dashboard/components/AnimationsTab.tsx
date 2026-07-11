"use client";

import { useState, useEffect } from "react";
import { Sparkles, Play, ToggleLeft, Activity, RefreshCw } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { PortfolioContent } from "@/app/lib/types";

export default function AnimationsTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    animationsEnabled: true,
    animationSpeed: "normal" as "slow" | "normal" | "fast",
    animationType: "fade" as "fade" | "slide" | "zoom",
    animationDelay: 0.1,
    scrollEffects: true,
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
          animationsEnabled: res.content.animationsEnabled !== false,
          animationSpeed: res.content.animationSpeed || "normal",
          animationType: res.content.animationType || "fade",
          animationDelay: Number(res.content.animationDelay) || 0.1,
          scrollEffects: res.content.scrollEffects !== false,
        });
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
        ...formData,
      });
      if (res.success) {
        alert("Animation configurations updated successfully!");
        loadContent();
      } else {
        alert("Failed to save animation settings: " + (res.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error saving settings: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading animation configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-emerald-50 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
              <Sparkles className="h-3.5 w-3.5" />
              Motion Settings Studio
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900 md:text-3xl">Animation Controls</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Customize framer-motion transitions, speed parameters, delay settings, and scroll effects across the entire website interface.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="mr-2 inline-block h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving Changes..." : "Save Configuration"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Toggle States */}
        <div className="space-y-5 rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-[#8d6b4e]" /> Core Motion Controls
          </h3>
          <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/50 p-4 cursor-pointer hover:bg-gray-50">
            <div>
              <p className="text-sm font-bold text-gray-800">Enable Website Animations</p>
              <p className="text-xs text-gray-500">Toggle Framer Motion visuals on/off globally.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.animationsEnabled}
              onChange={(e) => setFormData({ ...formData, animationsEnabled: e.target.checked })}
              className="h-5 w-5 accent-cyan-600"
            />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/50 p-4 cursor-pointer hover:bg-gray-50">
            <div>
              <p className="text-sm font-bold text-gray-800">Scroll View Effects</p>
              <p className="text-xs text-gray-500">Trigger entrance transitions when sections scroll into viewport view.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.scrollEffects}
              onChange={(e) => setFormData({ ...formData, scrollEffects: e.target.checked })}
              className="h-5 w-5 accent-cyan-600"
            />
          </label>
        </div>

        {/* Transition Parameters */}
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#8d6b4e]" /> Transition Parameters
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Global Animation Speed</label>
            <select
              value={formData.animationSpeed}
              onChange={(e) => setFormData({ ...formData, animationSpeed: e.target.value as "slow" | "normal" | "fast" })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            >
              <option value="slow">Slow Transition (Fluid & Dramatic)</option>
              <option value="normal">Normal Speed (Balanced)</option>
              <option value="fast">Fast Speed (Snappy & Quick)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Default Entrance Effect Type</label>
            <select
              value={formData.animationType}
              onChange={(e) => setFormData({ ...formData, animationType: e.target.value as "fade" | "slide" | "zoom" })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            >
              <option value="fade">Fade In</option>
              <option value="slide">Slide Up & Fade In</option>
              <option value="zoom">Scale Zoom & Fade In</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Stagger Delay Step (Seconds)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={formData.animationDelay}
              onChange={(e) => setFormData({ ...formData, animationDelay: Math.max(0, Math.min(1, Number(e.target.value) || 0.1)) })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
