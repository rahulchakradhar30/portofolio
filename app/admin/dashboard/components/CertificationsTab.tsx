"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, BadgeCheck, CalendarDays, Link2, Globe, Search } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { Certification } from "@/app/lib/types";

const parseUrlList = (input: string) => {
  const values = input
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return Array.from(new Set(values));
};

export default function CertificationsTab() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCertificationId, setEditingCertificationId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    issuedDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    imageUrl: "",
    description: "",
    linkedinUrl: "",
    featured: false,
    galleryImagesText: "",
    youtubeLinksText: "",
  });

  const resetCertificationForm = useCallback(() => {
    setFormData({ title: "", issuer: "", issuedDate: "", expiryDate: "", credentialId: "", credentialUrl: "", imageUrl: "", description: "", linkedinUrl: "", featured: false, galleryImagesText: "", youtubeLinksText: "" });
    setEditingCertificationId(null);
  }, []);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      const res = await adminAPI.getCertifications();
      if (res.success) {
        setCertifications(res.certifications || []);
      }
    } catch (error) {
      console.error('Error loading certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await adminAPI.uploadToCloudinary(file);
      if (res.success) {
        const uploadedUrl = res.fileUrl || res.imageUrl;
        setFormData({ ...formData, imageUrl: uploadedUrl });
        alert('Image uploaded to Cloudinary successfully!');
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCertification = async () => {
    if (!formData.title || !formData.issuer || !formData.imageUrl) {
      alert("Title, issuer, and image are required");
      return;
    }

    const newCertification = {
      title: formData.title,
      issuer: formData.issuer,
      issuedDate: formData.issuedDate,
      expiryDate: formData.expiryDate,
      credentialId: formData.credentialId,
      credentialUrl: formData.credentialUrl,
      image: formData.imageUrl,
      description: formData.description,
      linkedinUrl: formData.linkedinUrl,
      featured: formData.featured,
      galleryImages: parseUrlList(formData.galleryImagesText),
      youtubeLinks: parseUrlList(formData.youtubeLinksText),
    } as Record<string, unknown>;

    const res = editingCertificationId
      ? await adminAPI.updateCertification(editingCertificationId, newCertification)
      : await adminAPI.createCertification(newCertification);
    if (res.success) {
      alert(editingCertificationId ? "Certification updated successfully!" : "Certification added successfully!");
      resetCertificationForm();
      setShowForm(false);
      loadCertifications();
    } else {
      alert(`Failed to ${editingCertificationId ? 'update' : 'add'} certification`);
    }
  };

  const handleEditCertification = (cert: Certification) => {
    setFormData({
      title: cert.title || "",
      issuer: cert.issuer || "",
      issuedDate: cert.issuedDate || "",
      expiryDate: cert.expiryDate || "",
      credentialId: cert.credentialId || "",
      credentialUrl: cert.credentialUrl || "",
      imageUrl: cert.image || "",
      description: cert.description || "",
      linkedinUrl: cert.linkedinUrl || "",
      featured: Boolean(cert.featured),
      galleryImagesText: (cert.galleryImages || []).join("\n"),
      youtubeLinksText: (cert.youtubeLinks || []).join("\n"),
    });
    setEditingCertificationId(cert.id);
    setShowForm(true);
  };

  const handleDeleteCertification = async (certId: string) => {
    if (confirm("Are you sure you want to delete this certification?")) {
      const res = await adminAPI.deleteCertification(certId);
      if (res.success) {
        alert("Certification deleted!");
        loadCertifications();
      } else {
        alert("Failed to delete certification");
      }
    }
  };

  const filteredCertifications = certifications.filter((cert) => {
    const searchValue = query.trim().toLowerCase();
    if (!searchValue) return true;

    return [
      cert.title,
      cert.issuer,
      cert.description,
      cert.credentialId,
      cert.credentialUrl,
      cert.linkedinUrl,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchValue));
  });

  const featuredCount = certifications.filter((cert) => cert.featured).length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-emerald-50 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
              <BadgeCheck className="h-3.5 w-3.5" />
              Certifications Studio
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900 md:text-3xl">Manage Certifications</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Add, feature, preview, and organize all certification assets from one clean admin view.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{certifications.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Featured</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{featuredCount}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetCertificationForm();
                  setShowForm(false);
                } else {
                  setShowForm(true);
                }
              }}
              className="col-span-2 rounded-2xl bg-gradient-to-r from-[#8d6b4e] to-[#c4a884] px-4 py-4 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 sm:col-span-1"
            >
              <Plus className="mr-2 inline-block h-4 w-4" />
              {showForm ? 'Close Form' : 'Add Certification'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, issuer, credential, URL..."
            className="w-full rounded-2xl border border-cyan-100 bg-white px-10 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
          />
        </div>

        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredCertifications.length}</span> certifications
        </p>
      </div>

      {showForm && (
        <div className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-lg">
          <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-emerald-50 px-5 py-4 md:px-6">
            <h3 className="text-lg font-bold text-slate-900">Add Certification</h3>
            <p className="text-sm text-slate-600">Fill in the details and attach the certificate image.</p>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <input
                type="text"
                placeholder="Certification Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
              />
              <input
                type="text"
                placeholder="Issuer Name"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.issuedDate}
                    onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                  />
                </div>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                  />
                </div>
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative sm:col-span-2">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Credential ID (optional)"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                  />
                </div>
                <div className="relative sm:col-span-2">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    placeholder="Credential URL (optional)"
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                  />
                </div>
                <div className="relative sm:col-span-2">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    placeholder="LinkedIn URL (optional)"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-800">Certificate Image</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                  />
                  {uploading && <span className="text-sm font-medium text-cyan-700">Uploading to Cloudinary...</span>}
                </div>

                {formData.imageUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-sm">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      width={640}
                      height={360}
                      className="h-48 w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Preview ready</p>
                        <p className="text-xs text-slate-500">Uploaded to Cloudinary</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-sm text-slate-500">
                    Upload a certificate image to show a live preview here.
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddCertification}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {editingCertificationId ? "Update Certification" : "Add Certification"}
          </button>
          {editingCertificationId && (
            <button
              type="button"
              onClick={() => {
                resetCertificationForm();
                setShowForm(false);
              }}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel Editing
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          filteredCertifications.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between hover:border-cyan-300"
            >
              <div className="flex gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200">
                  <Image src={cert.image} alt={cert.title} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{cert.title}</h3>
                  <p className="text-sm text-slate-600">{cert.issuer}</p>
                  <p className="text-xs text-slate-500 mt-1">Issued: {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cert.featured ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-700'}`}>{cert.featured ? 'Featured' : 'Standard'}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditCertification(cert)} className="p-1.5 text-blue-600 hover:bg-slate-50 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteCertification(cert.id)} className="p-1.5 text-red-600 hover:bg-slate-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
