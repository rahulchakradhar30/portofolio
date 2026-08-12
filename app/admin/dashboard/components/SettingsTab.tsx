"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Trash2, Search, Link2, FileText, Image as ImageIcon, Settings, Upload, Check, Globe, Power, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { PortfolioContent } from "@/app/lib/types";
import Security2FASection from "./Security2FASection";

interface MediaAsset {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  url: string;
  publicId: string;
  created_at?: string;
}

export default function SettingsTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socials, setSocials] = useState({
    instagram: "",
    linkedin: "",
    github: "",
    email: "",
    location: "",
    resumeUrl: "",
  });

  // Media Library State
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaSearch, setMediaSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Favicon State
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [togglingFavicon, setTogglingFavicon] = useState(false);
  const [faviconError, setFaviconError] = useState<string | null>(null);
  const [faviconSuccess, setFaviconSuccess] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
    loadMediaLibrary();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await adminAPI.getPortfolioContent();
      if (res.success && res.content) {
        setContent(res.content);
        setSocials({
          instagram: res.content.instagram || "",
          linkedin: res.content.linkedin || "",
          github: res.content.github || "",
          email: res.content.email || "",
          location: res.content.location || "",
          resumeUrl: res.content.resumeUrl || "",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    setFaviconError(null);
    setFaviconSuccess(null);

    try {
      const res = await adminAPI.uploadFavicon(file);
      if (res.success && res.faviconConfig) {
        setContent((prev: PortfolioContent | null) => (prev ? { ...prev, faviconConfig: res.faviconConfig } : prev));
        setFaviconSuccess("Favicon updated successfully!");
        setPreviewKey(Date.now());
      } else {
        setFaviconError(res.error || "Failed to upload favicon");
      }
    } catch (err) {
      setFaviconError("An error occurred during favicon upload");
    } finally {
      setUploadingFavicon(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleFavicon = async (enabled: boolean) => {
    setTogglingFavicon(true);
    setFaviconError(null);
    setFaviconSuccess(null);

    try {
      const res = await adminAPI.updateFaviconConfig({ enabled });
      if (res.success && res.faviconConfig) {
        setContent((prev: PortfolioContent | null) => (prev ? { ...prev, faviconConfig: res.faviconConfig } : prev));
        setFaviconSuccess(enabled ? "Custom Favicon enabled!" : "Default Favicon activated!");
        setPreviewKey(Date.now());
      } else {
        setFaviconError(res.error || "Failed to update favicon state");
      }
    } catch (err) {
      setFaviconError("Error updating favicon state");
    } finally {
      setTogglingFavicon(false);
    }
  };

  const handleRemoveFavicon = async () => {
    if (!confirm("Are you sure you want to remove the custom favicon and restore default portfolio branding?")) return;

    setTogglingFavicon(true);
    setFaviconError(null);
    setFaviconSuccess(null);

    try {
      const res = await adminAPI.removeFavicon();
      if (res.success && res.faviconConfig) {
        setContent((prev: PortfolioContent | null) => (prev ? { ...prev, faviconConfig: res.faviconConfig } : prev));
        setFaviconSuccess("Favicon removed. Default portfolio favicon restored!");
        setPreviewKey(Date.now());
      } else {
        setFaviconError(res.error || "Failed to remove favicon");
      }
    } catch (err) {
      setFaviconError("Error removing favicon");
    } finally {
      setTogglingFavicon(false);
    }
  };

  const handleRestoreDefault = async () => {
    await handleRemoveFavicon();
  };

  const loadMediaLibrary = async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaAssets(data.assets || []);
      }
    } catch (error) {
      console.error("Error loading media library:", error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSaveSocials = async () => {
    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...content,
        ...socials,
      });
      if (res.success) {
        alert("System parameters updated successfully!");
        loadSettings();
      } else {
        alert("Failed to save parameters");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteAsset = async (asset: MediaAsset) => {
    if (!confirm(`Are you sure you want to delete "${asset.fileName}"? This cannot be undone and will break any references to this URL.`)) return;

    try {
      // 1. Delete from Cloudinary
      if (asset.publicId) {
        await fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: asset.publicId }),
        });
      }

      // 2. Delete registry from Firestore
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: asset.id }),
      });

      if (res.ok) {
        alert("Media asset deleted successfully!");
        loadMediaLibrary();
      } else {
        alert("Failed to clean up media entry");
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Error deleting asset");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredMedia = mediaAssets.filter((asset: MediaAsset) => {
    const q = mediaSearch.toLowerCase().trim();
    if (!q) return true;
    return asset.fileName.toLowerCase().includes(q) || asset.fileType.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="text-center py-10 text-[var(--foreground)]/60">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Two-Factor Authentication Security Section */}
      <Security2FASection />

      {/* System & Media -> Branding -> Website Favicon */}
      <div className="paper-card space-y-5 p-5 shadow-none md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b-2 border-[var(--foreground)]/10 pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
              <Globe className="h-5 w-5 text-[var(--accent)]" /> Website Favicon & Branding
            </h3>
            <p className="text-xs text-[var(--foreground)]/60 mt-0.5">
              Customize the browser tab icon for your site. Normalizes PNG, JPG, WEBP, ICO, and SVG files automatically.
            </p>
          </div>
          {content?.faviconConfig && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Status:</span>
              <button
                type="button"
                disabled={togglingFavicon}
                onClick={() => handleToggleFavicon(!content.faviconConfig?.enabled)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                  content.faviconConfig.enabled
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {content.faviconConfig.enabled ? "Custom Favicon Active" : "Default Favicon Active"}
              </button>
            </div>
          )}
        </div>

        {faviconError && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{faviconError}</span>
          </div>
        )}

        {faviconSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{faviconSuccess}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 items-start">
          {/* Live Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Browser Tab Preview
            </label>
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-950 p-4 space-y-3">
              <div className="flex items-center gap-2 rounded-t-xl bg-gray-200 dark:bg-zinc-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-700 max-w-full">
                <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg shadow-sm w-full overflow-hidden">
                  <img
                    key={previewKey}
                    src={
                      content?.faviconConfig?.enabled && content?.faviconConfig?.url
                        ? content.faviconConfig.url
                        : `/api/favicon?t=${Date.now()}`
                    }
                    alt="Favicon Preview"
                    className="w-4 h-4 object-contain rounded-sm"
                  />
                  <span className="truncate font-medium text-xs text-slate-800 dark:text-slate-200">
                    {content?.seoTitle || "Rahul Chakradhar | AI/ML Engineer"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Format: {content?.faviconConfig?.mimeType || "image/png"}</span>
                <span>
                  {content?.faviconConfig?.size
                    ? formatBytes(content.faviconConfig.size)
                    : "Standard fallback"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls & Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Favicon Actions
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Supported input formats: <code className="bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">PNG, JPG, WEBP, ICO, SVG</code> (Max size: 2MB).
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.ico,.svg,image/png,image/jpeg,image/webp,image/x-icon,image/svg+xml"
                onChange={handleFaviconUpload}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={uploadingFavicon}
                  onClick={() => fileInputRef.current?.click()}
                  className="paper-button-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingFavicon
                    ? "Processing..."
                    : content?.faviconConfig?.url
                    ? "Replace Favicon"
                    : "Upload Favicon"}
                </button>

                {content?.faviconConfig?.url && (
                  <button
                    type="button"
                    disabled={uploadingFavicon || togglingFavicon}
                    onClick={handleRemoveFavicon}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Favicon
                  </button>
                )}

                {content?.faviconConfig?.url && (
                  <button
                    type="button"
                    disabled={uploadingFavicon || togglingFavicon}
                    onClick={handleRestoreDefault}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Default
                  </button>
                )}
              </div>
            </div>

            {content?.faviconConfig?.originalName && (
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 p-3 text-xs space-y-1">
                <div className="font-semibold text-gray-700 dark:text-gray-300">File Metadata</div>
                <div className="text-gray-500 truncate">Name: {content.faviconConfig.originalName}</div>
                {content.faviconConfig.updatedAt && (
                  <div className="text-gray-400">
                    Updated: {new Date(content.faviconConfig.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Links & System Settings */}
      <div className="paper-card space-y-4 p-5 shadow-none md:p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <Settings className="h-5 w-5 text-[var(--accent)]" /> System Links & Info
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={socials.email}
              onChange={(e) => setSocials({ ...socials, email: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location Label</label>
            <input
              type="text"
              value={socials.location}
              onChange={(e) => setSocials({ ...socials, location: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Resume Document URL</label>
            <input
              type="text"
              value={socials.resumeUrl}
              onChange={(e) => setSocials({ ...socials, resumeUrl: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">GitHub Profile Link</label>
            <input
              type="url"
              value={socials.github}
              onChange={(e) => setSocials({ ...socials, github: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn Profile Link</label>
            <input
              type="url"
              value={socials.linkedin}
              onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram Link</label>
            <input
              type="url"
              value={socials.instagram}
              onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white"
            />
          </div>
        </div>
        <button type="button" disabled={saving} onClick={handleSaveSocials} className="paper-button-primary mt-4 px-6 py-2.5 text-sm font-semibold disabled:opacity-50">
          {saving ? "Updating..." : "Save Parameters"}
        </button>
      </div>

      {/* Production-Grade Media Library */}
      <div className="paper-card space-y-4 p-5 shadow-none md:p-6">
        <div className="flex flex-col gap-3 border-b-2 border-[var(--foreground)]/10 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
              <ImageIcon className="h-5 w-5 text-[var(--accent)]" /> Media Asset Library
            </h3>
            <p className="text-xs text-[var(--foreground)]/55">Duplicate-free secure media database. Search, view, copy URLs, and clean up files.</p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={mediaSearch}
              onChange={(e) => setMediaSearch(e.target.value)}
              placeholder="Search filename or type..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-9 py-2 text-sm text-slate-800 outline-none focus:bg-white focus:border-cyan-300"
            />
          </div>
        </div>

        {loadingMedia ? (
          <div className="text-center py-6 text-[var(--foreground)]/45">Loading library...</div>
        ) : filteredMedia.length === 0 ? (
          <div className="paper-card border-dashed py-10 text-center text-[var(--foreground)]/60 shadow-none">
            No media assets found in library.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMedia.map((asset: MediaAsset) => (
              <div key={asset.id} className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm hover:border-[#8d6b4e]/30 flex flex-col justify-between">
                {asset.fileType.startsWith("image/") ? (
                  <div className="relative h-32 overflow-hidden bg-gray-100 border-b">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center bg-gray-50 border-b text-gray-400">
                    <FileText className="h-10 w-10" />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-800 truncate" title={asset.fileName}>{asset.fileName}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{formatBytes(asset.size)}</span>
                    <span className="uppercase">{asset.fileType.split("/")[1] || asset.fileType}</span>
                  </div>
                  <div className="flex gap-2 pt-1 border-t">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(asset.url, asset.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {copiedId === asset.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      {copiedId === asset.id ? "Copied" : "Copy URL"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset)}
                      className="rounded-lg border border-red-100 p-1.5 hover:bg-red-50"
                      title="Delete asset"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
