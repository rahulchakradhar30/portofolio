"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  Copy,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Building2,
  Upload,
  X,
  Sparkles,
  Save,
} from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { ExperienceItem, Skill, Project } from "@/app/lib/types";

export default function ExperienceTab() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal / Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form Fields
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formEmploymentType, setFormEmploymentType] = useState("Full-time");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsCurrent, setFormIsCurrent] = useState(false);
  const [formLocation, setFormLocation] = useState("");
  const [formWorkMode, setFormWorkMode] = useState("Remote");
  const [formCompanyLogo, setFormCompanyLogo] = useState("");
  const [formCompanyLogoPublicId, setFormCompanyLogoPublicId] = useState("");
  const [formShortDescription, setFormShortDescription] = useState("");
  const [formDetailedDescription, setFormDetailedDescription] = useState("");
  const [formAchievements, setFormAchievements] = useState<string[]>([]);
  const [formNewAchievement, setFormNewAchievement] = useState("");
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [formTechnologies, setFormTechnologies] = useState<string[]>([]);
  const [formRelatedProjectId, setFormRelatedProjectId] = useState("");
  const [formCompanyUrl, setFormCompanyUrl] = useState("");
  const [formVisible, setFormVisible] = useState(true);

  // Load all experiences, skills, and projects
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, skillRes, projRes] = await Promise.all([
        adminAPI.getExperiences(),
        adminAPI.getSkills(),
        adminAPI.getProjects(),
      ]);

      if (expRes.success) setExperiences(expRes.experiences || []);
      if (skillRes.success) setSkills(skillRes.skills || []);
      if (projRes.success) setProjects(projRes.projects || []);
    } catch {
      showToast("Failed to load experience entries.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (text: string, type: "success" | "error") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Open Form for Adding New Experience
  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormCompanyName("");
    setFormRole("");
    setFormEmploymentType("Full-time");
    setFormStartDate("");
    setFormEndDate("");
    setFormIsCurrent(false);
    setFormLocation("");
    setFormWorkMode("Remote");
    setFormCompanyLogo("");
    setFormCompanyLogoPublicId("");
    setFormShortDescription("");
    setFormDetailedDescription("");
    setFormAchievements([]);
    setFormNewAchievement("");
    setFormSkills([]);
    setFormTechnologies([]);
    setFormRelatedProjectId("");
    setFormCompanyUrl("");
    setFormVisible(true);
    setIsEditing(true);
  };

  // Open Form for Editing Existing Experience
  const handleOpenEditForm = (item: ExperienceItem) => {
    setEditingId(item.id);
    setFormCompanyName(item.companyName || "");
    setFormRole(item.role || "");
    setFormEmploymentType(item.employmentType || "Full-time");
    setFormStartDate(item.startDate || "");
    setFormEndDate(item.endDate || "");
    setFormIsCurrent(Boolean(item.isCurrent));
    setFormLocation(item.location || "");
    setFormWorkMode(item.workMode || "Remote");
    setFormCompanyLogo(item.companyLogo || "");
    setFormCompanyLogoPublicId(item.companyLogoPublicId || "");
    setFormShortDescription(item.shortDescription || "");
    setFormDetailedDescription(item.detailedDescription || "");
    setFormAchievements(Array.isArray(item.achievements) ? [...item.achievements] : []);
    setFormNewAchievement("");
    setFormSkills(Array.isArray(item.skills) ? [...item.skills] : []);
    setFormTechnologies(Array.isArray(item.technologies) ? [...item.technologies] : []);
    setFormRelatedProjectId(item.relatedProjectId || "");
    setFormCompanyUrl(item.companyUrl || "");
    setFormVisible(item.visible !== false);
    setIsEditing(true);
  };

  // Logo File Upload Handler
  const handleLogoFileUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormCompanyLogo(data.imageUrl);
        setFormCompanyLogoPublicId(data.publicId || "");
        showToast(
          data.isDuplicate
            ? "Reused previously optimized logo asset!"
            : "Company logo uploaded and optimized successfully!",
          "success"
        );
      } else {
        showToast(data.error || "Failed to upload company logo", "error");
      }
    } catch (err) {
      showToast("Logo upload error: " + String(err), "error");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Experience (Create or Update)
  const handleSaveExperience = async () => {
    if (!formCompanyName.trim() || !formRole.trim()) {
      showToast("Company name and Role title are required.", "error");
      return;
    }

    const payload = {
      companyName: formCompanyName.trim(),
      role: formRole.trim(),
      employmentType: formEmploymentType,
      startDate: formStartDate.trim(),
      endDate: formIsCurrent ? "" : formEndDate.trim(),
      isCurrent: formIsCurrent,
      location: formLocation.trim(),
      workMode: formWorkMode,
      companyLogo: formCompanyLogo,
      companyLogoPublicId: formCompanyLogoPublicId,
      shortDescription: formShortDescription.trim(),
      detailedDescription: formDetailedDescription.trim(),
      achievements: formAchievements.filter(Boolean),
      skills: formSkills,
      technologies: formTechnologies,
      relatedProjectId: formRelatedProjectId,
      companyUrl: formCompanyUrl.trim(),
      visible: formVisible,
    };

    if (editingId) {
      const res = await adminAPI.updateExperience(editingId, payload);
      if (res.success) {
        showToast("Experience updated successfully!", "success");
        setIsEditing(false);
        loadData();
      } else {
        showToast(res.error || "Failed to update experience.", "error");
      }
    } else {
      const res = await adminAPI.createExperience(payload);
      if (res.success) {
        showToast("New experience created successfully!", "success");
        setIsEditing(false);
        loadData();
      } else {
        showToast(res.error || "Failed to create experience.", "error");
      }
    }
  };

  // Delete Experience
  const handleDeleteExperience = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete experience "${name}"?`)) return;
    const res = await adminAPI.deleteExperience(id);
    if (res.success) {
      showToast("Experience deleted successfully.", "success");
      loadData();
    } else {
      showToast("Failed to delete experience.", "error");
    }
  };

  // Duplicate Experience
  const handleDuplicateExperience = async (item: ExperienceItem) => {
    const duplicatePayload = {
      ...item,
      companyName: `${item.companyName} (Copy)`,
      order: experiences.length + 1,
    };

    // Remove ID
    const { id: _, ...payload } = duplicatePayload;

    const res = await adminAPI.createExperience(payload);
    if (res.success) {
      showToast("Experience duplicated successfully!", "success");
      loadData();
    } else {
      showToast("Failed to duplicate experience.", "error");
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (item: ExperienceItem) => {
    const res = await adminAPI.updateExperience(item.id, {
      visible: !item.visible,
    });
    if (res.success) {
      showToast(`Experience ${item.visible ? "hidden" : "published"}.`, "success");
      loadData();
    }
  };

  // Reorder
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= experiences.length) return;

    const newExp = [...experiences];
    const temp = newExp[index];
    newExp[index] = newExp[targetIdx];
    newExp[targetIdx] = temp;

    setExperiences(newExp);
    const orderedIds = newExp.map((e) => e.id);
    await adminAPI.reorderExperiences(orderedIds);
  };

  // Achievement List Helpers
  const handleAddAchievement = () => {
    if (!formNewAchievement.trim()) return;
    setFormAchievements([...formAchievements, formNewAchievement.trim()]);
    setFormNewAchievement("");
  };

  const handleRemoveAchievement = (idx: number) => {
    setFormAchievements(formAchievements.filter((_, i) => i !== idx));
  };

  const handleMoveAchievement = (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= formAchievements.length) return;
    const copy = [...formAchievements];
    const temp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = temp;
    setFormAchievements(copy);
  };

  // Toggle Skill or Tech Selection
  const handleToggleSkill = (skillId: string) => {
    setFormSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleToggleTech = (skillId: string) => {
    setFormTechnologies((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[var(--foreground)] opacity-70">
        <Briefcase className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--accent)]" />
        <p>Loading Experience entries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color,rgba(0,0,0,0.1))]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[var(--accent)]" />
            <span>Experience Manager</span>
          </h2>
          <p className="text-sm text-[var(--foreground)] opacity-70 mt-1">
            Create, edit, reorder, and persist Admin-controlled professional career experiences.
          </p>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[var(--accent)] text-white hover:opacity-90 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-md ${
              actionMessage.type === "success"
                ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300"
                : "bg-rose-500/15 text-rose-700 border border-rose-500/30 dark:text-rose-300"
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List of Experience Entries */}
      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)]">
            <Building2 className="w-10 h-10 mx-auto text-[var(--accent)] mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">No Experience Entries Yet</h3>
            <p className="text-sm text-[var(--foreground)] opacity-70 max-w-md mx-auto mt-1 mb-4">
              Click &quot;Add Experience&quot; to build your persisted professional experience timeline.
            </p>
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Entry</span>
            </button>
          </div>
        ) : (
          experiences.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border bg-[var(--surface)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                item.visible === false
                  ? "opacity-60 border-dashed border-[var(--border-color,rgba(0,0,0,0.2))]"
                  : "border-[var(--border-color,rgba(0,0,0,0.1))]"
              }`}
            >
              {/* Left Item Meta */}
              <div className="flex items-center gap-4">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveOrder(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-[var(--surface-soft)] disabled:opacity-30"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(index, "down")}
                    disabled={index === experiences.length - 1}
                    className="p-1 rounded hover:bg-[var(--surface-soft)] disabled:opacity-30"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Company Logo Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-color,rgba(0,0,0,0.1))] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.companyLogo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.companyLogo}
                      alt={item.companyName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-[var(--accent)]" />
                  )}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[var(--foreground)]">{item.role}</h3>
                    {item.employmentType && (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--surface-soft)] text-[var(--accent)]">
                        {item.employmentType}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--foreground)] opacity-75 font-medium mt-0.5">
                    <span>{item.companyName}</span>
                    <span className="mx-1.5">•</span>
                    <span className="font-mono">
                      {item.startDate || "Start"} — {item.isCurrent ? "Present" : item.endDate || "End"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleVisibility(item)}
                  className="p-2 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--foreground)] opacity-70 hover:opacity-100"
                  title={item.visible ? "Hide from Public Homepage" : "Show on Public Homepage"}
                >
                  {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-amber-500" />}
                </button>

                <button
                  onClick={() => handleDuplicateExperience(item)}
                  className="p-2 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--foreground)] opacity-70 hover:opacity-100"
                  title="Duplicate Entry"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenEditForm(item)}
                  className="p-2 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--accent)] font-semibold flex items-center gap-1"
                  title="Edit Entry"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteExperience(item.id, item.companyName)}
                  className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Editor Modal / Drawer */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-color,rgba(0,0,0,0.15))] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
            >
              {/* Modal Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color,rgba(0,0,0,0.1))]">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[var(--accent)]" />
                  <span>{editingId ? "Edit Experience Entry" : "Add New Experience Entry"}</span>
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg hover:bg-[var(--surface-soft)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="e.g. Google, Vercel, OpenAI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Role Title */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Role / Position Title *
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formEmploymentType}
                    onChange={(e) => setFormEmploymentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                {/* Work Mode */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Work Mode
                  </label>
                  <select
                    value={formWorkMode}
                    onChange={(e) => setFormWorkMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    placeholder="e.g. Jan 2023 or 2023-01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* End Date & Current Position Checkbox */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80">
                      End Date
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsCurrent}
                        onChange={(e) => setFormIsCurrent(e.target.checked)}
                        className="rounded border-[var(--accent)] text-[var(--accent)]"
                      />
                      <span>Current Position (Present)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={formIsCurrent}
                    value={formIsCurrent ? "Present" : formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    placeholder="e.g. Dec 2024 or 2024-12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Company Website URL */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Company Website URL
                  </label>
                  <input
                    type="text"
                    value={formCompanyUrl}
                    onChange={(e) => setFormCompanyUrl(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Company Logo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1.5">
                  Company Logo (Auto-Compressed Upload)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Logo Preview */}
                  <div className="w-20 h-20 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border-color,rgba(0,0,0,0.15))] p-2 flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                    {formCompanyLogo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={formCompanyLogo}
                        alt="Company logo preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-[var(--accent)] opacity-60" />
                    )}
                  </div>

                  {/* Dropzone / Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--surface-soft)] border border-[var(--border-color,rgba(0,0,0,0.15))] cursor-pointer hover:bg-[var(--border-color,rgba(0,0,0,0.05))] transition-colors">
                        <Upload className="w-4 h-4 text-[var(--accent)]" />
                        <span>{uploadingLogo ? "Compressing & Uploading..." : "Choose Logo File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleLogoFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>

                      {formCompanyLogo && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormCompanyLogo("");
                            setFormCompanyLogoPublicId("");
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--foreground)] opacity-60">
                      Upload JPEG, PNG, WebP, or SVG. Files are automatically compressed and optimized before storage. If unprovided, a clean fallback icon will be rendered.
                    </p>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Short Summary Description
                  </label>
                  <input
                    type="text"
                    value={formShortDescription}
                    onChange={(e) => setFormShortDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence high-level overview"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                    Detailed Responsibilities / Scope
                  </label>
                  <textarea
                    rows={3}
                    value={formDetailedDescription}
                    onChange={(e) => setFormDetailedDescription(e.target.value)}
                    placeholder="Full scope of responsibilities, team size, architecture impact..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Achievements Bullet Points Manager */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Key Achievements / Responsibilities Bullets</span>
                </label>

                <div className="space-y-2 mb-3">
                  {formAchievements.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-color,rgba(0,0,0,0.1))]"
                    >
                      <span className="text-xs font-mono font-bold text-[var(--accent)] w-5 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updated = [...formAchievements];
                          updated[idx] = e.target.value;
                          setFormAchievements(updated);
                        }}
                        className="flex-1 bg-transparent text-xs font-medium focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveAchievement(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-xs opacity-60 hover:opacity-100 disabled:opacity-20"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAchievement(idx, "down")}
                          disabled={idx === formAchievements.length - 1}
                          className="p-1 text-xs opacity-60 hover:opacity-100 disabled:opacity-20"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(idx)}
                          className="p-1 text-rose-500 hover:opacity-80"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formNewAchievement}
                    onChange={(e) => setFormNewAchievement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAchievement();
                      }
                    }}
                    placeholder="Type an achievement bullet and press Add..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 shrink-0"
                  >
                    Add Bullet
                  </button>
                </div>
              </div>

              {/* Linked Central Skills Picker */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1.5">
                  Link Skills Gained (Central Skills System)
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)]">
                  {skills.map((sk) => {
                    const isSelected = formSkills.includes(sk.id);
                    return (
                      <button
                        type="button"
                        key={sk.id}
                        onClick={() => handleToggleSkill(sk.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border-color,rgba(0,0,0,0.1))] opacity-70 hover:opacity-100"
                        }`}
                      >
                        {sk.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Linked Central Technologies Picker */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1.5">
                  Link Technologies Used (Central Skills System)
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)]">
                  {skills.map((sk) => {
                    const isSelected = formTechnologies.includes(sk.id);
                    return (
                      <button
                        type="button"
                        key={sk.id}
                        onClick={() => handleToggleTech(sk.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border-color,rgba(0,0,0,0.1))] opacity-70 hover:opacity-100"
                        }`}
                      >
                        {sk.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Related Project Picker */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--foreground)] opacity-80 mb-1">
                  Associate Related Project (Optional)
                </label>
                <select
                  value={formRelatedProjectId}
                  onChange={(e) => setFormRelatedProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color,rgba(0,0,0,0.15))] bg-[var(--surface-soft)] text-sm focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">-- No Related Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-[var(--border-color,rgba(0,0,0,0.1))]">
                <label className="inline-flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formVisible}
                    onChange={(e) => setFormVisible(e.target.checked)}
                    className="rounded border-[var(--accent)] text-[var(--accent)]"
                  />
                  <span>Publish & Make Visible on Homepage</span>
                </label>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--surface-soft)] hover:bg-[var(--border-color,rgba(0,0,0,0.08))]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExperience}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Experience</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
