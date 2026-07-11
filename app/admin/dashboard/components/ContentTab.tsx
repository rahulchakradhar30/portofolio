"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import { DEFAULT_SITE_COPY, getSiteCopy } from "@/app/lib/siteCopy";
import type {
  Project,
  Skill,
  Certification,
  PortfolioContent,
  RadarConfig,
  RadarKind,
  SectionVisibility,
  StudyRoadmapItem,
  StudyRoadmapMetricType,
  StudyRoadmapStageMetric,
} from "@/app/lib/types";

const DEFAULT_CONTENT_STATS = [
  { label: "Major Projects", value: "3+" },
  { label: "Certifications", value: "5+" },
  { label: "Websites Published", value: "2+" },
  { label: "Success Rate", value: "90%" },
];

const DEFAULT_RADAR_CONFIG: RadarConfig = {
  enabledKinds: ["skill", "project", "certification"],
  skillIds: [],
  projectIds: [],
  certificationIds: [],
  maxSkills: 5,
  maxProjects: 3,
  maxCertifications: 3,
};

const DEFAULT_STUDY_ROADMAP: StudyRoadmapItem[] = [
  {
    id: "school",
    stage: "School",
    institution: "School Education",
    period: "Foundation Years",
    description: "Built academic fundamentals and consistent learning discipline.",
    tags: ["Basics", "Discipline", "Curiosity"],
    isHigherStudy: false,
  },
  {
    id: "high-school",
    stage: "High School",
    institution: "Secondary Education",
    period: "Higher Secondary",
    description: "Strengthened core subjects and developed problem-solving ability.",
    tags: ["Science", "Math", "Problem Solving"],
    isHigherStudy: false,
  },
  {
    id: "intermediate",
    stage: "Intermediate",
    institution: "Intermediate College",
    period: "Pre-University",
    description: "Prepared for advanced studies with structured technical focus.",
    tags: ["Pre-University", "Focus", "Preparation"],
    isHigherStudy: false,
  },
  {
    id: "university",
    stage: "Graduate / University",
    institution: "GITAM University, Bengaluru",
    period: "Current",
    description: "Building practical AI and software systems through applied projects.",
    tags: ["AI", "Engineering", "Projects"],
    isHigherStudy: false,
  },
];

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  hero: true,
  about: true,
  roadmap: true,
  radar: true,
  skills: true,
  projects: true,
  certifications: true,
  contact: true,
};

const METRIC_LABEL_BY_TYPE: Record<StudyRoadmapMetricType, string> = {
  cgpa: "CGPA",
  ccpa: "CCPA",
  percentage: "Percentage",
  marks: "Marks",
  custom: "Metric",
};

const DEFAULT_STAGE_METRIC = (roadmapItemId: string): StudyRoadmapStageMetric => ({
  roadmapItemId,
  enabled: false,
  metricType: "percentage",
  label: "Percentage",
  value: "",
});

export default function ContentTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [roadmapTagDrafts, setRoadmapTagDrafts] = useState<Record<string, string>>({});
  const [siteCopyForm, setSiteCopyForm] = useState(DEFAULT_SITE_COPY);
  const [radarConfigForm, setRadarConfigForm] = useState<RadarConfig>(DEFAULT_RADAR_CONFIG);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [availableCertifications, setAvailableCertifications] = useState<Certification[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const normalizeRadarConfig = (input?: Partial<RadarConfig> | null): RadarConfig => ({
    enabledKinds:
      Array.isArray(input?.enabledKinds) && input!.enabledKinds.length > 0
        ? input!.enabledKinds.filter(
            (kind): kind is RadarKind => kind === "skill" || kind === "project" || kind === "certification"
          )
        : DEFAULT_RADAR_CONFIG.enabledKinds,
    skillIds: Array.isArray(input?.skillIds) ? input!.skillIds.filter(Boolean) : [],
    projectIds: Array.isArray(input?.projectIds) ? input!.projectIds.filter(Boolean) : [],
    certificationIds: Array.isArray(input?.certificationIds) ? input!.certificationIds.filter(Boolean) : [],
    maxSkills: Math.min(12, Math.max(1, Number(input?.maxSkills) || DEFAULT_RADAR_CONFIG.maxSkills)),
    maxProjects: Math.min(12, Math.max(1, Number(input?.maxProjects) || DEFAULT_RADAR_CONFIG.maxProjects)),
    maxCertifications: Math.min(12, Math.max(1, Number(input?.maxCertifications) || DEFAULT_RADAR_CONFIG.maxCertifications)),
  });

  const normalizeStudyRoadmap = (input?: StudyRoadmapItem[] | null): StudyRoadmapItem[] => {
    if (!Array.isArray(input) || input.length === 0) return DEFAULT_STUDY_ROADMAP;

    const mapped = input
      .map((item, index) => {
        if (!item) return null;
        if (!item.stage || !item.institution || !item.period || !item.description) return null;

        return {
          id: item.id || `roadmap-${index + 1}`,
          stage: item.stage,
          institution: item.institution,
          period: item.period,
          description: item.description,
          tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
          isHigherStudy: Boolean(item.isHigherStudy),
        };
      })
      .filter((item): item is StudyRoadmapItem => Boolean(item));

    return mapped.length > 0 ? mapped : DEFAULT_STUDY_ROADMAP;
  };

  const normalizeSectionVisibility = (input?: Partial<SectionVisibility> | null): SectionVisibility => ({
    hero: input?.hero !== false,
    about: input?.about !== false,
    roadmap: input?.roadmap !== false,
    radar: input?.radar !== false,
    skills: input?.skills !== false,
    projects: input?.projects !== false,
    certifications: input?.certifications !== false,
    contact: input?.contact !== false,
  });

  const normalizeStageMetrics = (
    roadmapItems: StudyRoadmapItem[],
    metrics: unknown
  ): StudyRoadmapStageMetric[] => {
    const defaults = roadmapItems.map((item) => DEFAULT_STAGE_METRIC(item.id));

    if (metrics && typeof metrics === "object" && !Array.isArray(metrics)) {
      const legacy = metrics as {
        showCgpa?: boolean;
        cgpaLabel?: string;
        cgpaValue?: string;
        showMarks?: boolean;
        marksLabel?: string;
        marksValue?: string;
      };
      const intermediateId = roadmapItems[2]?.id || roadmapItems[0]?.id;

      return defaults.map((entry) => {
        if (entry.roadmapItemId !== intermediateId) return entry;
        if (legacy.showCgpa && legacy.cgpaValue) {
          return {
            ...entry,
            enabled: true,
            metricType: "cgpa",
            label: legacy.cgpaLabel || METRIC_LABEL_BY_TYPE.cgpa,
            value: legacy.cgpaValue,
          };
        }
        if (legacy.showMarks && legacy.marksValue) {
          return {
            ...entry,
            enabled: true,
            metricType: "percentage",
            label: legacy.marksLabel || METRIC_LABEL_BY_TYPE.percentage,
            value: legacy.marksValue,
          };
        }
        return entry;
      });
    }

    if (!Array.isArray(metrics)) return defaults;

    const byId = new Map<string, StudyRoadmapStageMetric>();
    for (const item of metrics) {
      if (!item || typeof item !== "object") continue;
      const value = item as Partial<StudyRoadmapStageMetric>;
      if (!value.roadmapItemId) continue;

      const metricType: StudyRoadmapMetricType =
        value.metricType === "cgpa" ||
        value.metricType === "ccpa" ||
        value.metricType === "percentage" ||
        value.metricType === "marks" ||
        value.metricType === "custom"
          ? value.metricType
          : "percentage";

      byId.set(value.roadmapItemId, {
        roadmapItemId: value.roadmapItemId,
        enabled: Boolean(value.enabled),
        metricType,
        label: value.label?.trim() || METRIC_LABEL_BY_TYPE[metricType],
        value: value.value?.trim() || "",
      });
    }

    return roadmapItems.map((item) => byId.get(item.id) || DEFAULT_STAGE_METRIC(item.id));
  };

  const updateSiteCopyField = <K extends keyof typeof DEFAULT_SITE_COPY>(
    key: K,
    value: (typeof DEFAULT_SITE_COPY)[K]
  ) => {
    setSiteCopyForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadContent = useCallback(async () => {
    try {
      const [res, skillsRes, projectsRes, certsRes] = await Promise.all([
        adminAPI.getPortfolioContent(),
        adminAPI.getSkills(),
        adminAPI.getProjects(),
        adminAPI.getCertifications(),
      ]);

      if (skillsRes.success) setAvailableSkills((skillsRes.skills as Skill[]) || []);
      if (projectsRes.success) setAvailableProjects((projectsRes.projects as Project[]) || []);
      if (certsRes.success) setAvailableCertifications((certsRes.certifications as Certification[]) || []);

      if (res.success && res.content) {
        const normalizedRoadmap = normalizeStudyRoadmap(res.content.studyRoadmap);

        setContent({
          ...res.content,
          instagram: res.content.instagram || "",
          linkedin: res.content.linkedin || "",
          github: res.content.github || "",
          studyRoadmapEnabled: res.content.studyRoadmapEnabled !== false,
          allowRoadmapExtension: Boolean(res.content.allowRoadmapExtension),
          studyRoadmap: normalizedRoadmap,
          studyRoadmapMetrics: normalizeStageMetrics(normalizedRoadmap, res.content.studyRoadmapMetrics),
          sectionVisibility: normalizeSectionVisibility(res.content.sectionVisibility),
          aboutStats:
            Array.isArray(res.content.aboutStats) && res.content.aboutStats.length > 0
              ? res.content.aboutStats
              : DEFAULT_CONTENT_STATS,
        });
        setRoadmapTagDrafts(
          Object.fromEntries(
            normalizedRoadmap.map((item) => [item.id, (item.tags || []).join(", ")])
          )
        );
        setSiteCopyForm(getSiteCopy(res.content));
        setRadarConfigForm(normalizeRadarConfig((res.content as PortfolioContent).radarConfig));
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async () => {
    if (!content) {
      alert("No content to save");
      return;
    }

    setSaving(true);
    try {
      const res = await adminAPI.updatePortfolioContent({
        ...(content as unknown as Record<string, unknown>),
        siteCopy: siteCopyForm,
        radarConfig: radarConfigForm,
      });
      if (res.success) {
        alert("Content updated successfully!");
        setEditMode(false);
      } else {
        alert("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  const handleContentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "bannerImage" | "profileImage" | "resumeUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    setUploading(true);
    try {
      const res = await adminAPI.uploadToCloudinary(file);
      if (res.success) {
        const uploadedUrl = res.fileUrl || res.imageUrl;
        setContent({ ...content, [field]: uploadedUrl });
        if (field === "resumeUrl") {
          alert("Resume uploaded to Cloudinary successfully!");
        } else {
          alert(`${field === "bannerImage" ? "Banner" : "Profile"} image uploaded to Cloudinary successfully!`);
        }
      } else {
        alert(field === "resumeUrl" ? "Failed to upload resume" : "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(field === "resumeUrl" ? "Error uploading resume" : "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Homepage Content</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 rounded-lg bg-[#8d6b4e] px-4 py-2 text-white"
          >
            <Edit2 className="w-5 h-5" />
            {editMode ? "Cancel" : "Edit"}
          </motion.button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
            <input
              type="text"
              value={content?.heroTitle || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), heroTitle: e.target.value })}
              disabled={!editMode}
              className="w-full rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-3 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 disabled:border-[#eadbbf] disabled:bg-[#f7efe4] disabled:text-[#6a5846]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
            <input
              type="text"
              value={content?.heroSubtitle || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), heroSubtitle: e.target.value })}
              disabled={!editMode}
              className="w-full rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-3 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 disabled:border-[#eadbbf] disabled:bg-[#f7efe4] disabled:text-[#6a5846]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Tagline</label>
            <input
              type="text"
              value={(content as PortfolioContent & { heroTagline?: string })?.heroTagline || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), heroTagline: e.target.value })}
              disabled={!editMode}
              className="w-full rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-3 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 disabled:border-[#eadbbf] disabled:bg-[#f7efe4] disabled:text-[#6a5846]"
            />
          </div>

          {editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Banner Image</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleContentImageUpload(e, "bannerImage")}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
              </div>
              {(content as PortfolioContent & { bannerImage?: string })?.bannerImage && (
                <div className="mt-2">
                  <Image
                    src={(content as PortfolioContent & { bannerImage?: string })?.bannerImage || ""}
                    alt="Banner Preview"
                    width={800}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image (Hero Ring)</label>
            <p className="mb-3 text-xs text-gray-500">Shown in the circular frame on the right side of the hero section.</p>

            {(content as PortfolioContent & { profileImage?: string })?.profileImage ? (
              <div className="mb-3">
                <Image
                  src={(content as PortfolioContent & { profileImage?: string })?.profileImage || ""}
                  alt="Profile Preview"
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-full border-4 border-[#d8cab9] object-cover"
                />
              </div>
            ) : (
              <div className="mb-3 flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500">
                No profile image
              </div>
            )}

            {editMode ? (
              <>
                <input
                  type="url"
                  value={(content as PortfolioContent & { profileImage?: string })?.profileImage || ""}
                  onChange={(e) => setContent({ ...(content as PortfolioContent), profileImage: e.target.value })}
                  placeholder="Paste profile image URL or upload below"
                  className="mb-2 w-full rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-2 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20"
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleContentImageUpload(e, "profileImage")}
                    disabled={uploading}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setContent({ ...(content as PortfolioContent), profileImage: "" })}
                    disabled={!(content as PortfolioContent & { profileImage?: string })?.profileImage}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove Image
                  </button>
                </div>
                {uploading && <span className="mt-2 block text-sm text-gray-500">Uploading...</span>}
              </>
            ) : (
              <p className="text-xs text-gray-500">Enable Edit mode to add, change, or remove the profile image.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About Text</label>
            <textarea
              rows={4}
              value={content?.aboutText || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), aboutText: e.target.value })}
              disabled={!editMode}
              className="w-full resize-none rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-3 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 disabled:border-[#eadbbf] disabled:bg-[#f7efe4] disabled:text-[#6a5846]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resume PDF</label>
            <p className="mb-3 text-xs text-gray-500">This controls the Resume button in Hero. Upload a PDF or paste a hosted file URL.</p>

            {(content as PortfolioContent & { resumeUrl?: string })?.resumeUrl ? (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Resume available
              </div>
            ) : (
              <div className="mb-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-xs text-gray-500">
                No resume uploaded
              </div>
            )}

            {editMode ? (
              <>
                <input
                  type="url"
                  value={(content as PortfolioContent & { resumeUrl?: string })?.resumeUrl || ""}
                  onChange={(e) => setContent({ ...(content as PortfolioContent), resumeUrl: e.target.value })}
                  placeholder="Paste resume PDF URL"
                  className="mb-2 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-400 transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleContentImageUpload(e, "resumeUrl")}
                    disabled={uploading}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setContent({ ...(content as PortfolioContent), resumeUrl: "" })}
                    disabled={!(content as PortfolioContent & { resumeUrl?: string })?.resumeUrl}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove Resume
                  </button>
                </div>
                {uploading && <span className="mt-2 block text-sm text-gray-500">Uploading...</span>}
              </>
            ) : (
              <p className="text-xs text-gray-500">Enable Edit mode to upload or replace resume.</p>
            )}

            {(content as PortfolioContent & { resumeUrl?: string })?.resumeUrl && (
              <a
                href={(content as PortfolioContent & { resumeUrl?: string })?.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex rounded-lg border border-[#c4a884] px-3 py-2 text-sm font-semibold text-[#8d6b4e] hover:bg-[#f7efe4]"
              >
                Open Resume
              </a>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <div className="mb-1 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-gray-700">Homepage Copy Controls</label>
              <span className="text-xs text-gray-500">Grouped for mobile editing</span>
            </div>

            <details open className="rounded-lg border border-gray-200 bg-gray-50/70">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800">Header & Navigation</summary>
              <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-3">
                <input type="text" value={siteCopyForm.headerBrand} onChange={(e) => updateSiteCopyField("headerBrand", e.target.value)} disabled={!editMode} placeholder="Header Brand" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.headerHireCta} onChange={(e) => updateSiteCopyField("headerHireCta", e.target.value)} disabled={!editMode} placeholder="Header CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navHome} onChange={(e) => updateSiteCopyField("navHome", e.target.value)} disabled={!editMode} placeholder="Nav Home" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navAbout} onChange={(e) => updateSiteCopyField("navAbout", e.target.value)} disabled={!editMode} placeholder="Nav About" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navRadar} onChange={(e) => updateSiteCopyField("navRadar", e.target.value)} disabled={!editMode} placeholder="Nav Radar" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navSkills} onChange={(e) => updateSiteCopyField("navSkills", e.target.value)} disabled={!editMode} placeholder="Nav Skills" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navProjects} onChange={(e) => updateSiteCopyField("navProjects", e.target.value)} disabled={!editMode} placeholder="Nav Projects" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navHire} onChange={(e) => updateSiteCopyField("navHire", e.target.value)} disabled={!editMode} placeholder="Nav Hire" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navContact} onChange={(e) => updateSiteCopyField("navContact", e.target.value)} disabled={!editMode} placeholder="Nav Contact" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 bg-gray-50/70">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800">Hero</summary>
              <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-2">
                <input type="text" value={siteCopyForm.heroBadge} onChange={(e) => updateSiteCopyField("heroBadge", e.target.value)} disabled={!editMode} placeholder="Hero Badge" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.heroEditorialBadge} onChange={(e) => updateSiteCopyField("heroEditorialBadge", e.target.value)} disabled={!editMode} placeholder="Hero Secondary Badge" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.heroCTA1} onChange={(e) => updateSiteCopyField("heroCTA1", e.target.value)} disabled={!editMode} placeholder="Hero CTA 1" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.heroCTA2} onChange={(e) => updateSiteCopyField("heroCTA2", e.target.value)} disabled={!editMode} placeholder="Hero CTA 2" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.heroCurrentFocusLabel} onChange={(e) => updateSiteCopyField("heroCurrentFocusLabel", e.target.value)} disabled={!editMode} placeholder="Hero Focus Label" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <textarea rows={2} value={siteCopyForm.heroCurrentFocusText} onChange={(e) => updateSiteCopyField("heroCurrentFocusText", e.target.value)} disabled={!editMode} placeholder="Hero focus text" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-gray-700">Hero Spotlights</label>
                    <button
                      type="button"
                      onClick={() =>
                        updateSiteCopyField("heroSpotlights", [
                          ...siteCopyForm.heroSpotlights,
                          { title: "New Spotlight", copy: "" },
                        ])
                      }
                      disabled={!editMode}
                      className="inline-flex items-center gap-1 rounded-md border border-violet-300 px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Spotlight
                    </button>
                  </div>
                  <div className="space-y-2">
                    {siteCopyForm.heroSpotlights.map((spotlight, index) => (
                      <div key={`hero-spotlight-${index}`} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-2 md:grid-cols-[1fr_2fr_auto]">
                        <input
                          type="text"
                          value={spotlight.title}
                          disabled={!editMode}
                          onChange={(e) => {
                            const next = [...siteCopyForm.heroSpotlights];
                            next[index] = { ...next[index], title: e.target.value };
                            updateSiteCopyField("heroSpotlights", next);
                          }}
                          placeholder="Spotlight title"
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black"
                        />
                        <input
                          type="text"
                          value={spotlight.copy}
                          disabled={!editMode}
                          onChange={(e) => {
                            const next = [...siteCopyForm.heroSpotlights];
                            next[index] = { ...next[index], copy: e.target.value };
                            updateSiteCopyField("heroSpotlights", next);
                          }}
                          placeholder="Spotlight description"
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black"
                        />
                        <button
                          type="button"
                          onClick={() => updateSiteCopyField("heroSpotlights", siteCopyForm.heroSpotlights.filter((_, idx) => idx !== index))}
                          disabled={!editMode || siteCopyForm.heroSpotlights.length <= 1}
                          className="rounded-md border border-red-300 px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 bg-gray-50/70">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800">About</summary>
              <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-2">
                <input type="text" value={siteCopyForm.aboutBadge} onChange={(e) => updateSiteCopyField("aboutBadge", e.target.value)} disabled={!editMode} placeholder="About Badge" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.aboutHeading} onChange={(e) => updateSiteCopyField("aboutHeading", e.target.value)} disabled={!editMode} placeholder="About Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.aboutShortTitle} onChange={(e) => updateSiteCopyField("aboutShortTitle", e.target.value)} disabled={!editMode} placeholder="About Short Title" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.aboutShortCopy} onChange={(e) => updateSiteCopyField("aboutShortCopy", e.target.value)} disabled={!editMode} placeholder="About Short Copy" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <textarea rows={3} value={siteCopyForm.aboutBody1} onChange={(e) => updateSiteCopyField("aboutBody1", e.target.value)} disabled={!editMode} placeholder="About primary paragraph" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <textarea rows={4} value={siteCopyForm.aboutBody2} onChange={(e) => updateSiteCopyField("aboutBody2", e.target.value)} disabled={!editMode} placeholder="About secondary paragraph" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <textarea rows={2} value={siteCopyForm.aboutFooter} onChange={(e) => updateSiteCopyField("aboutFooter", e.target.value)} disabled={!editMode} placeholder="About footer note" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-gray-700">About Highlight Tags</label>
                    <button
                      type="button"
                      onClick={() => updateSiteCopyField("aboutTags", [...siteCopyForm.aboutTags, "New Tag"])}
                      disabled={!editMode}
                      className="inline-flex items-center gap-1 rounded-md border border-violet-300 px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Tag
                    </button>
                  </div>
                  <div className="space-y-2">
                    {siteCopyForm.aboutTags.map((tag, idx) => (
                      <div key={`about-tag-${idx}`} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => {
                            const nextTags = [...siteCopyForm.aboutTags];
                            nextTags[idx] = e.target.value;
                            updateSiteCopyField("aboutTags", nextTags);
                          }}
                          disabled={!editMode}
                          placeholder={`Tag ${idx + 1}`}
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextTags = siteCopyForm.aboutTags.filter((_, index) => index !== idx);
                            updateSiteCopyField("aboutTags", nextTags);
                          }}
                          disabled={!editMode || siteCopyForm.aboutTags.length <= 1}
                          className="rounded-md border border-red-300 p-2 text-red-700 hover:bg-red-50"
                          title="Remove tag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 bg-gray-50/70">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800">Sections & Radar</summary>
              <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-2">
                <input type="text" value={siteCopyForm.skillsHeading} onChange={(e) => updateSiteCopyField("skillsHeading", e.target.value)} disabled={!editMode} placeholder="Skills Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.projectsHeading} onChange={(e) => updateSiteCopyField("projectsHeading", e.target.value)} disabled={!editMode} placeholder="Projects Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.certificationsHeading} onChange={(e) => updateSiteCopyField("certificationsHeading", e.target.value)} disabled={!editMode} placeholder="Certifications Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.contactHeading} onChange={(e) => updateSiteCopyField("contactHeading", e.target.value)} disabled={!editMode} placeholder="Contact Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.skillsSubtitle} onChange={(e) => updateSiteCopyField("skillsSubtitle", e.target.value)} disabled={!editMode} placeholder="Skills subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.projectsSubtitle} onChange={(e) => updateSiteCopyField("projectsSubtitle", e.target.value)} disabled={!editMode} placeholder="Projects subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.certificationsSubtitle} onChange={(e) => updateSiteCopyField("certificationsSubtitle", e.target.value)} disabled={!editMode} placeholder="Certifications subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.contactSubtitle} onChange={(e) => updateSiteCopyField("contactSubtitle", e.target.value)} disabled={!editMode} placeholder="Contact subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.skillsViewMore} onChange={(e) => updateSiteCopyField("skillsViewMore", e.target.value)} disabled={!editMode} placeholder="Skills View More CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.projectsViewMore} onChange={(e) => updateSiteCopyField("projectsViewMore", e.target.value)} disabled={!editMode} placeholder="Projects View More CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.certificationsViewMore} onChange={(e) => updateSiteCopyField("certificationsViewMore", e.target.value)} disabled={!editMode} placeholder="Certifications View More CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.skillsEmpty} onChange={(e) => updateSiteCopyField("skillsEmpty", e.target.value)} disabled={!editMode} placeholder="Skills empty state" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.projectsEmpty} onChange={(e) => updateSiteCopyField("projectsEmpty", e.target.value)} disabled={!editMode} placeholder="Projects empty state" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.certificationsEmpty} onChange={(e) => updateSiteCopyField("certificationsEmpty", e.target.value)} disabled={!editMode} placeholder="Certifications empty state" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.contactIntroTitle} onChange={(e) => updateSiteCopyField("contactIntroTitle", e.target.value)} disabled={!editMode} placeholder="Contact intro title" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.contactSocialPrompt} onChange={(e) => updateSiteCopyField("contactSocialPrompt", e.target.value)} disabled={!editMode} placeholder="Contact social prompt" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.contactIntroBody} onChange={(e) => updateSiteCopyField("contactIntroBody", e.target.value)} disabled={!editMode} placeholder="Contact intro body" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <input type="text" value={siteCopyForm.contactFormTitle} onChange={(e) => updateSiteCopyField("contactFormTitle", e.target.value)} disabled={!editMode} placeholder="Contact form title" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.contactSuccess} onChange={(e) => updateSiteCopyField("contactSuccess", e.target.value)} disabled={!editMode} placeholder="Contact success message" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.contactError} onChange={(e) => updateSiteCopyField("contactError", e.target.value)} disabled={!editMode} placeholder="Contact error message" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <input type="text" value={siteCopyForm.radarBadge} onChange={(e) => updateSiteCopyField("radarBadge", e.target.value)} disabled={!editMode} placeholder="Radar Badge" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.radarHeading} onChange={(e) => updateSiteCopyField("radarHeading", e.target.value)} disabled={!editMode} placeholder="Radar Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.radarSubtitle} onChange={(e) => updateSiteCopyField("radarSubtitle", e.target.value)} disabled={!editMode} placeholder="Radar subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <input type="text" value={siteCopyForm.radarFeatureTitle} onChange={(e) => updateSiteCopyField("radarFeatureTitle", e.target.value)} disabled={!editMode} placeholder="Radar feature title" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.radarFeatureCopy} onChange={(e) => updateSiteCopyField("radarFeatureCopy", e.target.value)} disabled={!editMode} placeholder="Radar feature copy" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.radarExploreSkills} onChange={(e) => updateSiteCopyField("radarExploreSkills", e.target.value)} disabled={!editMode} placeholder="Radar Skills CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.radarSeeProjects} onChange={(e) => updateSiteCopyField("radarSeeProjects", e.target.value)} disabled={!editMode} placeholder="Radar Projects CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />

                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">Select Skills For Radar</p>
                    <button
                      type="button"
                      disabled={!editMode}
                      onClick={() => setRadarConfigForm((prev) => ({ ...prev, skillIds: [] }))}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Auto Select
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2">
                    {availableSkills.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          disabled={!editMode}
                          checked={radarConfigForm.skillIds.includes(item.id)}
                          onChange={(e) => {
                            const nextIds = e.target.checked
                              ? [...radarConfigForm.skillIds, item.id]
                              : radarConfigForm.skillIds.filter((id) => id !== item.id);
                            setRadarConfigForm((prev) => ({ ...prev, skillIds: nextIds }));
                          }}
                          className="h-4 w-4"
                        />
                        {item.title}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">Select Projects For Radar</p>
                    <button
                      type="button"
                      disabled={!editMode}
                      onClick={() => setRadarConfigForm((prev) => ({ ...prev, projectIds: [] }))}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Auto Select
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2">
                    {availableProjects.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          disabled={!editMode}
                          checked={radarConfigForm.projectIds.includes(item.id)}
                          onChange={(e) => {
                            const nextIds = e.target.checked
                              ? [...radarConfigForm.projectIds, item.id]
                              : radarConfigForm.projectIds.filter((id) => id !== item.id);
                            setRadarConfigForm((prev) => ({ ...prev, projectIds: nextIds }));
                          }}
                          className="h-4 w-4"
                        />
                        {item.title}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">Select Certifications For Radar</p>
                    <button
                      type="button"
                      disabled={!editMode}
                      onClick={() => setRadarConfigForm((prev) => ({ ...prev, certificationIds: [] }))}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Auto Select
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2">
                    {availableCertifications.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          disabled={!editMode}
                          checked={radarConfigForm.certificationIds.includes(item.id)}
                          onChange={(e) => {
                            const nextIds = e.target.checked
                              ? [...radarConfigForm.certificationIds, item.id]
                              : radarConfigForm.certificationIds.filter((id) => id !== item.id);
                            setRadarConfigForm((prev) => ({ ...prev, certificationIds: nextIds }));
                          }}
                          className="h-4 w-4"
                        />
                        {item.title}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 bg-gray-50/70">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800">Footer</summary>
              <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-2">
                <input type="text" value={siteCopyForm.footerBrand} onChange={(e) => updateSiteCopyField("footerBrand", e.target.value)} disabled={!editMode} placeholder="Footer Brand" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.footerQuickLinksTitle} onChange={(e) => updateSiteCopyField("footerQuickLinksTitle", e.target.value)} disabled={!editMode} placeholder="Footer Quick Links Title" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.footerServicesTitle} onChange={(e) => updateSiteCopyField("footerServicesTitle", e.target.value)} disabled={!editMode} placeholder="Footer Services Title" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.footerMadeWith} onChange={(e) => updateSiteCopyField("footerMadeWith", e.target.value)} disabled={!editMode} placeholder="Footer Made With" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.footerLead} onChange={(e) => updateSiteCopyField("footerLead", e.target.value)} disabled={!editMode} placeholder="Footer lead paragraph" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <input type="text" value={siteCopyForm.footerCopyright} onChange={(e) => updateSiteCopyField("footerCopyright", e.target.value)} disabled={!editMode} placeholder="Footer copyright line" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-gray-700">Footer Services</label>
                    <button
                      type="button"
                      onClick={() => updateSiteCopyField("footerServices", [...siteCopyForm.footerServices, "New service"])}
                      disabled={!editMode}
                      className="inline-flex items-center gap-1 rounded-md border border-violet-300 px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Service
                    </button>
                  </div>

                  <div className="space-y-2">
                    {siteCopyForm.footerServices.map((service, idx) => (
                      <div key={`footer-service-${idx}`} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={service}
                          onChange={(e) => {
                            const next = [...siteCopyForm.footerServices];
                            next[idx] = e.target.value;
                            updateSiteCopyField("footerServices", next);
                          }}
                          disabled={!editMode}
                          placeholder={`Service ${idx + 1}`}
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black"
                        />
                        <button
                          type="button"
                          onClick={() => updateSiteCopyField("footerServices", siteCopyForm.footerServices.filter((_, index) => index !== idx))}
                          disabled={!editMode || siteCopyForm.footerServices.length <= 1}
                          className="rounded-md border border-red-300 p-2 text-red-700 hover:bg-red-50"
                          title="Remove service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="space-y-2 rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-semibold text-gray-700">Homepage Section Visibility</label>
            <p className="text-xs text-gray-500">Control which sections are shown on the public homepage.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { key: "hero", label: "Hero" },
                { key: "about", label: "About" },
                { key: "roadmap", label: "Academic Track" },
                { key: "radar", label: "Radar" },
                { key: "skills", label: "Skills" },
                { key: "projects", label: "Projects" },
                { key: "certifications", label: "Certifications" },
                { key: "contact", label: "Contact" },
              ].map((item) => (
                <label key={item.key} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(content?.sectionVisibility?.[item.key as keyof SectionVisibility] ?? DEFAULT_SECTION_VISIBILITY[item.key as keyof SectionVisibility])}
                    disabled={!editMode}
                    onChange={(e) =>
                      setContent({
                        ...(content as PortfolioContent),
                        sectionVisibility: {
                          ...(content?.sectionVisibility || DEFAULT_SECTION_VISIBILITY),
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">About Stats</label>
            <div className="grid gap-3">
              {(content?.aboutStats || DEFAULT_CONTENT_STATS).slice(0, 4).map((stat, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={stat.label || ""}
                    onChange={(e) => {
                      const nextStats = [...(content?.aboutStats || DEFAULT_CONTENT_STATS)];
                      nextStats[idx] = { ...nextStats[idx], label: e.target.value };
                      setContent({ ...(content as PortfolioContent), aboutStats: nextStats });
                    }}
                    disabled={!editMode}
                    placeholder="Stat label"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
                  />
                  <input
                    type="text"
                    value={stat.value || ""}
                    onChange={(e) => {
                      const nextStats = [...(content?.aboutStats || DEFAULT_CONTENT_STATS)];
                      nextStats[idx] = { ...nextStats[idx], value: e.target.value };
                      setContent({ ...(content as PortfolioContent), aboutStats: nextStats });
                    }}
                    disabled={!editMode}
                    placeholder="Stat value"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-semibold text-gray-700">Study Roadmap</label>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={content?.studyRoadmapEnabled !== false}
                    disabled={!editMode}
                    onChange={(e) => setContent({ ...(content as PortfolioContent), studyRoadmapEnabled: e.target.checked })}
                    className="h-4 w-4"
                  />
                  Show on homepage
                </label>
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(content?.allowRoadmapExtension)}
                    disabled={!editMode}
                    onChange={(e) => setContent({ ...(content as PortfolioContent), allowRoadmapExtension: e.target.checked })}
                    className="h-4 w-4"
                  />
                  Extend for higher studies
                </label>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Keep core stages (School, High School, Intermediate, Graduate/University). Mark extra entries as Higher Study to extend roadmap when enabled.
            </p>

            <div className="space-y-3">
              {(content?.studyRoadmap || DEFAULT_STUDY_ROADMAP).map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="rounded-lg border border-gray-200 bg-white p-3">
                  {(() => {
                    const stageMetrics = Array.isArray(content?.studyRoadmapMetrics)
                      ? content.studyRoadmapMetrics
                      : (content?.studyRoadmap || DEFAULT_STUDY_ROADMAP).map((entry) => DEFAULT_STAGE_METRIC(entry.id));

                    const currentMetric =
                      stageMetrics.find((metric) => metric.roadmapItemId === item.id) || DEFAULT_STAGE_METRIC(item.id);

                    const updateStageMetric = (patch: Partial<StudyRoadmapStageMetric>) => {
                      const merged = {
                        ...currentMetric,
                        ...patch,
                      };

                      const nextMetrics = (content?.studyRoadmap || DEFAULT_STUDY_ROADMAP).map((entry) => {
                        if (entry.id === item.id) return merged;
                        return stageMetrics.find((metric) => metric.roadmapItemId === entry.id) || DEFAULT_STAGE_METRIC(entry.id);
                      });

                      setContent({
                        ...(content as PortfolioContent),
                        studyRoadmapMetrics: nextMetrics,
                      });
                    };

                    return (
                      <>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Stage {idx + 1}</p>
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                              <input
                                type="checkbox"
                                checked={Boolean(item.isHigherStudy)}
                                disabled={!editMode}
                                onChange={(e) => {
                                  const nextItems = [...(content?.studyRoadmap || DEFAULT_STUDY_ROADMAP)];
                                  nextItems[idx] = { ...nextItems[idx], isHigherStudy: e.target.checked };
                                  setContent({ ...(content as PortfolioContent), studyRoadmap: nextItems });
                                }}
                                className="h-4 w-4"
                              />
                              Higher Study
                            </label>
                            <button
                              type="button"
                              disabled={!editMode || (content?.studyRoadmap || DEFAULT_STUDY_ROADMAP).length <= 1}
                              onClick={() => {
                                const nextItems = (content?.studyRoadmap || DEFAULT_STUDY_ROADMAP).filter((_, index) => index !== idx);
                                const nextMetrics = (content?.studyRoadmapMetrics || []).filter(
                                  (metric) => metric.roadmapItemId !== item.id
                                );
                                setRoadmapTagDrafts((prev) => {
                                  const next = { ...prev };
                                  delete next[item.id];
                                  return next;
                                });
                                setContent({ ...(content as PortfolioContent), studyRoadmap: nextItems, studyRoadmapMetrics: nextMetrics });
                              }}
                              className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <input
                            type="text"
                            value={item.stage}
                            disabled={!editMode}
                            onChange={(e) => {
                              const nextItems = [...(content?.studyRoadmap || DEFAULT_STUDY_ROADMAP)];
                              nextItems[idx] = { ...nextItems[idx], stage: e.target.value };
                              setContent({ ...(content as PortfolioContent), studyRoadmap: nextItems });
                            }}
                            placeholder="Stage (e.g., High School)"
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black"
                          />
                          <input
                            type="text"
                            value={item.period}
                            disabled={!editMode}
                            onChange={(e) => {
                              const nextItems = [...(content?.studyRoadmap || DEFAULT_STUDY_ROADMAP)];
                              nextItems[idx] = { ...nextItems[idx], period: e.target.value };
                              setContent({ ...(content as PortfolioContent), studyRoadmap: nextItems });
                            }}
                            placeholder="Period"
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black"
                          />
                          <input
                            type="text"
                            value={item.institution}
                            disabled={!editMode}
                            onChange={(e) => {
                              const nextItems = [...(content?.studyRoadmap || DEFAULT_STUDY_ROADMAP)];
                              nextItems[idx] = { ...nextItems[idx], institution: e.target.value };
                              setContent({ ...(content as PortfolioContent), studyRoadmap: nextItems });
                            }}
                            placeholder="Institution"
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2"
                          />
                          <textarea
                            rows={2}
                            value={item.description}
                            disabled={!editMode}
                            onChange={(e) => {
                              const nextItems = [...(content?.studyRoadmap || DEFAULT_STUDY_ROADMAP)];
                              nextItems[idx] = { ...nextItems[idx], description: e.target.value };
                              setContent({ ...(content as PortfolioContent), studyRoadmap: nextItems });
                            }}
                            placeholder="Description"
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2"
                          />
                          <input
                            type="text"
                            value={roadmapTagDrafts[item.id] ?? (item.tags || []).join(", ")}
                            disabled={!editMode}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setRoadmapTagDrafts((prev) => ({ ...prev, [item.id]: raw }));
                              const nextItems = [...(content?.studyRoadmap || DEFAULT_STUDY_ROADMAP)];
                              nextItems[idx] = {
                                ...nextItems[idx],
                                tags: raw.split(",").map((tag) => tag.trim()).filter(Boolean),
                              };
                              setContent({ ...(content as PortfolioContent), studyRoadmap: nextItems });
                            }}
                            placeholder="Tags (comma separated)"
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2"
                          />

                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-2">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Academic Metric For This Stage</p>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                              <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 md:col-span-1">
                                <input
                                  type="checkbox"
                                  checked={Boolean(currentMetric.enabled)}
                                  disabled={!editMode}
                                  onChange={(e) => updateStageMetric({ enabled: e.target.checked })}
                                  className="h-4 w-4"
                                />
                                Show Metric
                              </label>

                              <select
                                value={currentMetric.metricType}
                                disabled={!editMode}
                                onChange={(e) => {
                                  const nextType = e.target.value as StudyRoadmapMetricType;
                                  updateStageMetric({ metricType: nextType, label: METRIC_LABEL_BY_TYPE[nextType] });
                                }}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black"
                              >
                                <option value="cgpa">CGPA</option>
                                <option value="ccpa">CCPA</option>
                                <option value="percentage">Percentage</option>
                                <option value="marks">Marks</option>
                                <option value="custom">Custom</option>
                              </select>

                              <input
                                type="text"
                                value={currentMetric.label}
                                disabled={!editMode}
                                onChange={(e) => updateStageMetric({ label: e.target.value })}
                                placeholder="Metric label"
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black"
                              />

                              <input
                                type="text"
                                value={currentMetric.value}
                                disabled={!editMode}
                                onChange={(e) => updateStageMetric({ value: e.target.value })}
                                placeholder="Example: 9.1 / 10 or 94%"
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={!editMode}
              onClick={() => {
                const nextItem = {
                  id: `roadmap-${Date.now()}`,
                  stage: "Higher Study",
                  institution: "",
                  period: "",
                  description: "",
                  tags: [],
                  isHigherStudy: true,
                } as StudyRoadmapItem;

                const nextItems = [...(content?.studyRoadmap || DEFAULT_STUDY_ROADMAP), nextItem];
                const nextMetrics = [
                  ...(content?.studyRoadmapMetrics ||
                    (content?.studyRoadmap || DEFAULT_STUDY_ROADMAP).map((entry) => DEFAULT_STAGE_METRIC(entry.id))),
                  DEFAULT_STAGE_METRIC(nextItem.id),
                ];

                setRoadmapTagDrafts((prev) => ({ ...prev, [nextItem.id]: "" }));
                setContent({ ...(content as PortfolioContent), studyRoadmap: nextItems, studyRoadmapMetrics: nextMetrics });
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-300 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add Roadmap Stage
            </button>
          </div>

          {editMode && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
