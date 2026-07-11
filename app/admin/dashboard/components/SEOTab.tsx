"use client";

import { useState, useEffect } from "react";
import { Globe, FileText, Search, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { PortfolioContent } from "@/app/lib/types";

export default function SEOTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoCanonicalUrl: "",
    seoOgImage: "",
    seoTwitterCard: "summary_large_image",
    seoFavicon: "",
    seoThemeColor: "#8d6b4e",
    seoRobots: "index, follow",
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
          seoTitle: res.content.seoTitle || "",
          seoDescription: res.content.seoDescription || "",
          seoKeywords: res.content.seoKeywords || "",
          seoCanonicalUrl: res.content.seoCanonicalUrl || "",
          seoOgImage: res.content.seoOgImage || "",
          seoTwitterCard: res.content.seoTwitterCard || "summary_large_image",
          seoFavicon: res.content.seoFavicon || "",
          seoThemeColor: res.content.seoThemeColor || "#8d6b4e",
          seoRobots: res.content.seoRobots || "index, follow",
        });
      }
    } catch (error) {
      console.error("Error loading SEO configurations:", error);
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
        alert("SEO settings updated successfully!");
        loadContent();
      } else {
        alert("Failed to save SEO settings: " + (res.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error saving settings: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await adminAPI.uploadToCloudinary(file);
      if (res.success) {
        setFormData((prev) => ({ ...prev, seoOgImage: res.fileUrl || res.imageUrl }));
        alert("OG Image uploaded successfully!");
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading image");
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading SEO configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-emerald-50 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
              <Globe className="h-3.5 w-3.5" />
              SEO Management Studio
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900 md:text-3xl">Search Engine Optimization</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Optimize metadata, social sharing cards, canonical URLs, and indexing configurations to ensure maximum search engine visibility.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="mr-2 inline-block h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Metadata */}
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Search className="h-5 w-5 text-[#8d6b4e]" /> Core Metadata Settings
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Global SEO Title</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              placeholder="E.g. Rahul Chakradhar | AI Systems & Web Development"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Description</label>
            <textarea
              rows={4}
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              placeholder="Enter search snippet summary description..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Keywords (comma-separated)</label>
            <input
              type="text"
              value={formData.seoKeywords}
              onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
              placeholder="AI, Software Developer, Storytelling, Portfolio"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        {/* Crawler & Advanced Settings */}
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#8d6b4e]" /> Crawler & Technical SEO
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Base Canonical URL</label>
            <input
              type="url"
              value={formData.seoCanonicalUrl}
              onChange={(e) => setFormData({ ...formData, seoCanonicalUrl: e.target.value })}
              placeholder="https://rahulchakradhar.com"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Robots.txt Rules Directive</label>
            <input
              type="text"
              value={formData.seoRobots}
              onChange={(e) => setFormData({ ...formData, seoRobots: e.target.value })}
              placeholder="index, follow"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Theme Color Hex</label>
              <input
                type="color"
                value={formData.seoThemeColor}
                onChange={(e) => setFormData({ ...formData, seoThemeColor: e.target.value })}
                className="h-12 w-full cursor-pointer rounded-2xl border border-gray-200 bg-gray-50 p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Favicon Icon URL</label>
              <input
                type="text"
                value={formData.seoFavicon}
                onChange={(e) => setFormData({ ...formData, seoFavicon: e.target.value })}
                placeholder="/favicon.ico"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Social Card / Open Graph Settings */}
        <div className="md:col-span-2 space-y-4 rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#8d6b4e]" /> Social Meta (Open Graph & Twitter Cards)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Twitter Card Mode</label>
                <select
                  value={formData.seoTwitterCard}
                  onChange={(e) => setFormData({ ...formData, seoTwitterCard: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
                >
                  <option value="summary">Summary Card (Small Image)</option>
                  <option value="summary_large_image">Summary Card with Large Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Open Graph Image (OG Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Preview OG Image</label>
              {formData.seoOgImage ? (
                <div className="relative h-44 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.seoOgImage} alt="OG Card Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-sm text-gray-500">
                  No OG Image specified. Upload one to preview it here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
