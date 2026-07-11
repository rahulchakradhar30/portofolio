"use client";

import { useState, useEffect } from "react";
import { Copy, Trash2, Search, Link2, FileText, Image as ImageIcon, Settings, Upload, Check } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { PortfolioContent } from "@/app/lib/types";

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

  const filteredMedia = mediaAssets.filter((asset) => {
    const q = mediaSearch.toLowerCase().trim();
    if (!q) return true;
    return asset.fileName.toLowerCase().includes(q) || asset.fileType.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Social Links & System Settings */}
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#8d6b4e]" /> System Links & Info
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
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveSocials}
          className="mt-4 rounded-xl bg-[#8d6b4e] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        >
          {saving ? "Updating..." : "Save Parameters"}
        </button>
      </div>

      {/* Production-Grade Media Library */}
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#8d6b4e]" /> Media Asset Library
            </h3>
            <p className="text-xs text-gray-500">Duplicate-free secure media database. Search, view, copy URLs, and clean up files.</p>
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
          <div className="text-center py-6 text-gray-400">Loading library...</div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-2xl text-gray-500 bg-gray-50">
            No media assets found in library.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMedia.map((asset) => (
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
