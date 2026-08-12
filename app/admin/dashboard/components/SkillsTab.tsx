"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import { SKILL_LOGO_PRESETS, SKILL_LOGO_CATEGORIES, resolveSkillIconUrl } from "@/app/lib/skillLogoCatalog";
import type { Skill } from "@/app/lib/types";
import SkillIcon from "@/app/components/SkillIcon";
import { LocalInput } from "@/app/components/LocalInput";

const normalizeSkillIcon = (iconValue?: string) => {
  const resolved = resolveSkillIconUrl(iconValue);
  if (resolved) return resolved;
  return iconValue?.trim() || "";
};

export default function SkillsTab() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [logoQuery, setLogoQuery] = useState("");
  const [logoCategory, setLogoCategory] = useState("All");
  const [visibleLogoCount, setVisibleLogoCount] = useState(120);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    proficiency: 75,
    icon: SKILL_LOGO_PRESETS[0].url,
    featured: false,
    order: "",
  });

  const resetSkillForm = useCallback(() => {
    setFormData({ title: "", description: "", proficiency: 75, icon: SKILL_LOGO_PRESETS[0].url, featured: false, order: "" });
    setEditingSkillId(null);
  }, []);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await adminAPI.getSkills();
      if (res.success) {
        setSkills((res.skills || []).map((skill: Skill) => ({ ...skill, icon: normalizeSkillIcon(skill.icon) })));
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!formData.title) {
      alert("Skill title is required");
      return;
    }

    try {
      const res = editingSkillId
        ? await adminAPI.updateSkill(editingSkillId, {
            title: formData.title,
            description: formData.description,
            proficiency: formData.proficiency,
            iconName: formData.icon,
            featured: formData.featured,
            order: formData.order !== "" ? parseInt(formData.order) : null,
          })
        : await adminAPI.createSkill({
            title: formData.title,
            description: formData.description,
            proficiency: formData.proficiency,
            iconName: formData.icon,
            featured: formData.featured,
            order: formData.order !== "" ? parseInt(formData.order) : null,
          });
      if (res.success) {
        alert(editingSkillId ? "Skill updated successfully!" : "Skill added successfully!");
        resetSkillForm();
        setShowForm(false);
        loadSkills();
      } else {
        const error = res.error ? ` ${res.error}` : '';
        alert(`Failed to add skill.${error}`);
        console.error('Skill creation failed:', res);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add skill'}`);
      console.error('Skill creation error:', error);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setFormData({
      title: skill.title || "",
      description: skill.description || "",
      proficiency: skill.proficiency || 75,
      icon: normalizeSkillIcon(skill.icon) || SKILL_LOGO_PRESETS[0].url,
      featured: Boolean(skill.featured),
      order: skill.order?.toString() || "",
    });
    setEditingSkillId(skill.id);
    setShowForm(true);
  };

  const filteredLogoPresets = useMemo(() => {
    const q = logoQuery.trim().toLowerCase();
    return SKILL_LOGO_PRESETS.filter((preset) => {
      const matchesCategory = logoCategory === "All" || preset.category === logoCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const searchable = `${preset.name} ${preset.category} ${(preset.keywords || []).join(" ")}`.toLowerCase();
      return searchable.includes(q);
    });
  }, [logoCategory, logoQuery]);

  const visibleLogoPresets = useMemo(
    () => filteredLogoPresets.slice(0, visibleLogoCount),
    [filteredLogoPresets, visibleLogoCount]
  );

  useEffect(() => {
    setVisibleLogoCount(120);
  }, [logoQuery, logoCategory]);

  const selectedLogo = SKILL_LOGO_PRESETS.find((preset) => preset.url === formData.icon);

  const handleDeleteSkill = async (skillId: string) => {
    if (confirm("Delete this skill?")) {
      const res = await adminAPI.deleteSkill(skillId);
      if (res.success) {
        alert("Skill deleted!");
        loadSkills();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="paper-card flex items-center justify-between gap-3 p-4 shadow-none md:p-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Manage Skills</h2>
          <p className="text-sm text-[var(--foreground)]/65">Curate the skill grid and logo presets shown on the public site.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (showForm) {
              resetSkillForm();
              setShowForm(false);
            } else {
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--foreground)] bg-[var(--accent)] px-4 py-2 text-white shadow-[4px_4px_0_0_rgba(47,36,27,0.12)]"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Close Form" : "Add Skill"}
        </motion.button>
      </div>

      {showForm && (
        <div className="paper-card space-y-4 p-6 shadow-none">
          <LocalInput
            placeholder="Skill Title"
            value={formData.title}
            onChange={(val) => setFormData((prev) => ({ ...prev, title: val }))}
          />
          <LocalInput
            isTextarea
            rows={3}
            placeholder="Skill Description"
            value={formData.description}
            onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
          />
          <LocalInput
            type="number"
            placeholder="Display Order (Optional, e.g. 1, 2, 3)"
            value={formData.order}
            onChange={(val) => setFormData((prev) => ({ ...prev, order: val }))}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Proficiency: {formData.proficiency}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.proficiency}
              onChange={(e) => setFormData((prev) => ({ ...prev, proficiency: parseInt(e.target.value) }))}
              className="w-full accent-violet-600"
            />
          </div>
          <div className="space-y-2 rounded-lg border border-violet-100 bg-violet-50/40 p-3">
            <label className="text-sm font-medium text-gray-700 block">Skill Logo (choose one)</label>
            <LocalInput
              placeholder="Search logos by name or category"
              value={logoQuery}
              onChange={(val) => setLogoQuery(val)}
              debounceMs={150}
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SKILL_LOGO_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setLogoCategory(category)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${logoCategory === category ? 'bg-violet-600 text-white' : 'border border-violet-200 bg-white text-violet-700 hover:bg-violet-50'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="max-h-64 overflow-auto rounded-lg border border-violet-100 bg-white p-2">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 2xl:grid-cols-8">
              {visibleLogoPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: preset.url })}
                  className={`group flex h-14 flex-col items-center justify-center rounded-lg border bg-white px-1 transition ${formData.icon === preset.url ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200 hover:border-violet-300'}`}
                  title={preset.name}
                >
                  <div
                    role="img"
                    aria-label={preset.name}
                    className="h-6 w-6 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${preset.url})` }}
                  />
                  <span className="mt-1 line-clamp-1 text-[10px] font-medium text-gray-600">{preset.name}</span>
                </button>
              ))}
              </div>
              {filteredLogoPresets.length > visibleLogoPresets.length && (
                <button
                  type="button"
                  onClick={() => setVisibleLogoCount((prev) => prev + 120)}
                  className="mt-3 w-full rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                >
                  Load 120 more logos ({filteredLogoPresets.length - visibleLogoPresets.length} remaining)
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-violet-200 bg-white p-3 mt-2">
              <SkillIcon title={formData.title || "Preview"} icon={formData.icon} className="h-8 w-8" />
              <div>
                <span className="text-xs font-bold text-gray-700 block">[ Logo Preview ] {formData.title || "Skill Title"}</span>
                {selectedLogo ? (
                  <span className="text-xs text-gray-500">{selectedLogo.name} ({selectedLogo.category})</span>
                ) : formData.icon ? (
                  <span className="text-xs text-amber-700 font-semibold">Custom / Mapped Logo</span>
                ) : (
                  <span className="text-xs text-amber-600 inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Generic Fallback Logo</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">Showing {visibleLogoPresets.length} of {filteredLogoPresets.length} logos</p>
            <input
              type="url"
              placeholder="Or paste a custom logo URL"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 accent-violet-600"
            />
            <span className="text-sm text-gray-700 font-medium">Feature this skill on homepage</span>
          </label>
          <button onClick={handleAddSkill} className="paper-button-primary w-full px-4 py-3 font-semibold">
            {editingSkillId ? "Update Skill" : "Add Skill"}
          </button>
          {editingSkillId && (
            <button
              type="button"
              onClick={() => {
                resetSkillForm();
                setShowForm(false);
              }}
              className="paper-button w-full px-4 py-3 font-semibold"
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
          skills.map((skill: Skill) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="paper-card p-4 shadow-none"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SkillIcon title={skill.title} icon={skill.icon} className="h-6 w-6" />
                  <h3 className="font-semibold text-gray-800">{skill.title}</h3>
                  {skill.featured && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">Featured</span>}
                  {skill.order !== undefined && skill.order !== null && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">Order: {skill.order}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditSkill(skill)} className="text-blue-600 hover:bg-gray-100 p-1 rounded" title="Edit Skill">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-600 hover:bg-gray-100 p-1 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${skill.proficiency || 75}%` }}></div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
