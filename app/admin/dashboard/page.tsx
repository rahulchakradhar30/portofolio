"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Menu, X, LogOut, Users, Activity, Settings as SettingsIcon, BarChart3, Award, Download, RefreshCw, ShieldCheck, Mail, Search, BadgeCheck, CalendarDays, Link2, Globe, Briefcase } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import { SKILL_LOGO_PRESETS, SKILL_LOGO_CATEGORIES, resolveSkillIconUrl } from "@/app/lib/skillLogoCatalog";
import { normalizeYouTubeUrl, normalizeYouTubeUrlList } from "@/app/lib/youtube";
import { DEFAULT_SITE_COPY, getSiteCopy } from "@/app/lib/siteCopy";
import AIAssistant from "@/app/components/AIAssistant";
import type { Project, Skill, ContactMessage, HireRequest, PortfolioContent, AdminUser, Certification, RadarConfig, RadarKind } from "@/app/lib/types";

const DEFAULT_CONTENT_STATS = [
  { label: 'Major Projects', value: '3+' },
  { label: 'Certifications', value: '5+' },
  { label: 'Websites Published', value: '2+' },
  { label: 'Success Rate', value: '90%' },
];

const DEFAULT_RADAR_CONFIG: RadarConfig = {
  enabledKinds: ['skill', 'project', 'certification'],
  skillIds: [],
  projectIds: [],
  certificationIds: [],
  maxSkills: 5,
  maxProjects: 3,
  maxCertifications: 3,
};

const parseUrlList = (input: string) => {
  const values = input
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return Array.from(new Set(values));
};

const removeAtIndex = (values: string[], indexToRemove: number) => values.filter((_, index) => index !== indexToRemove);

const normalizeSkillIcon = (iconValue?: string) => {
  const resolved = resolveSkillIconUrl(iconValue);
  if (resolved) return resolved;
  return iconValue?.trim() || "";
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/admin/auth/me', { method: 'GET' });
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }

        const data = await res.json();
        setAdminUser({
          id: data.user?.uid || 'admin',
          email: data.user?.email || '',
          name: data.user?.name || 'Admin',
          password_hash: '',
          role: 'admin',
          status: 'active',
        });
      } catch {
        router.replace('/admin/login');
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  if (authChecking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Checking admin session...</div>;
  }

  const adminTabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "content", label: "Content", icon: Edit2 },
    { id: "projects", label: "Projects", icon: Plus },
    { id: "skills", label: "Skills", icon: Plus },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "messages", label: "Contact Messages", icon: Mail },
    { id: "hireRequests", label: "Hire Requests", icon: Briefcase },
    { id: "users", label: "Users", icon: Users },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-40 h-screen w-64 bg-gray-900 text-white transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        initial={false}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-sm">
              RC
            </div>
            <span className="font-bold text-lg hidden md:inline">Admin</span>
          </div>
        </div>

        <nav className="p-2 md:p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg transition-colors text-sm md:text-base ${
                  activeTab === tab.id
                    ? "bg-violet-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`${sidebarOpen ? "inline" : "hidden"} md:inline`}>{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-4 left-4 right-4 flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="ml-0 transition-all duration-300 md:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gray-200 bg-white p-3 md:p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="text-right text-xs md:text-sm">
              <p className="text-gray-600 hidden sm:block">Logged in as</p>
              <p className="text-gray-800 font-medium truncate">{adminUser?.email}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex-shrink-0"></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-x-hidden p-3 md:p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "content" && <ContentTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "skills" && <SkillsTab />}
          {activeTab === "certifications" && <CertificationsTab />}
          {activeTab === "messages" && <MessagesTab inboxType="contact" />}
          {activeTab === "hireRequests" && <MessagesTab inboxType="hire" />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        onContentGenerated={(content, type) => {
          // Content will be used via the chatbot UI
          console.log('Generated content:', content, 'Type:', type);
        }}
      />
    </div>
  );
}

// Tab Components
function OverviewTab() {
  const [stats, setStats] = useState({ projects: 0, skills: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [projectsRes, skillsRes, messagesRes] = await Promise.all([
          adminAPI.getProjects(),
          fetch('/api/admin/skills').then(r => r.json()),
          adminAPI.getMessages(),
        ]);
        setStats({
          projects: projectsRes.projects?.length || 0,
          skills: skillsRes.skills?.length || 0,
          messages: messagesRes.messages?.length || 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: "Total Projects", value: stats.projects, color: "from-blue-500 to-blue-600" },
          { label: "Total Skills", value: stats.skills, color: "from-violet-500 to-violet-600" },
          { label: "Messages", value: stats.messages, color: "from-pink-500 to-pink-600" },
          { label: "Portfolio Views", value: "Live", color: "from-green-500 to-green-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} text-white p-4 md:p-6 rounded-xl md:rounded-2xl`}
          >
            <div className="text-2xl md:text-4xl font-bold">{loading ? "..." : stat.value}</div>
            <div className="text-opacity-80 text-sm md:text-base">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ContentTab() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
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
        ? (input!.enabledKinds.filter((kind): kind is RadarKind => kind === 'skill' || kind === 'project' || kind === 'certification'))
        : DEFAULT_RADAR_CONFIG.enabledKinds,
    skillIds: Array.isArray(input?.skillIds) ? input!.skillIds.filter(Boolean) : [],
    projectIds: Array.isArray(input?.projectIds) ? input!.projectIds.filter(Boolean) : [],
    certificationIds: Array.isArray(input?.certificationIds) ? input!.certificationIds.filter(Boolean) : [],
    maxSkills: Math.min(12, Math.max(1, Number(input?.maxSkills) || DEFAULT_RADAR_CONFIG.maxSkills)),
    maxProjects: Math.min(12, Math.max(1, Number(input?.maxProjects) || DEFAULT_RADAR_CONFIG.maxProjects)),
    maxCertifications: Math.min(12, Math.max(1, Number(input?.maxCertifications) || DEFAULT_RADAR_CONFIG.maxCertifications)),
  });

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
        setContent({
          ...res.content,
          instagram: res.content.instagram || '',
          linkedin: res.content.linkedin || '',
          github: res.content.github || '',
          aboutStats:
            Array.isArray(res.content.aboutStats) && res.content.aboutStats.length > 0
              ? res.content.aboutStats
              : DEFAULT_CONTENT_STATS,
        });
        setSiteCopyForm(getSiteCopy(res.content));
        setRadarConfigForm(normalizeRadarConfig((res.content as PortfolioContent).radarConfig));
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async () => {
    if (!content) {
      alert('No content to save');
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
        alert('Content updated successfully!');
        setEditMode(false);
      } else {
        alert('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleContentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'bannerImage' | 'profileImage' | 'resumeUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    setUploading(true);
    try {
      const res = await adminAPI.uploadToCloudinary(file);
      if (res.success) {
        const uploadedUrl = res.fileUrl || res.imageUrl;
        setContent({ ...content, [field]: uploadedUrl });
        if (field === 'resumeUrl') {
          alert('Resume uploaded to Cloudinary successfully!');
        } else {
          alert(`${field === 'bannerImage' ? 'Banner' : 'Profile'} image uploaded to Cloudinary successfully!`);
        }
      } else {
        alert(field === 'resumeUrl' ? 'Failed to upload resume' : 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(field === 'resumeUrl' ? 'Error uploading resume' : 'Error uploading image');
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
            className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2"
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
            <input
              type="text"
              value={content?.heroSubtitle || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), heroSubtitle: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Tagline</label>
            <input
              type="text"
              value={(content as PortfolioContent & { heroTagline?: string })?.heroTagline || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), heroTagline: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
            />
          </div>

          {editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Banner Image</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleContentImageUpload(e, 'bannerImage')}
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
                  className="h-32 w-32 rounded-full border-4 border-violet-200 object-cover"
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
                  className="mb-2 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-400 transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleContentImageUpload(e, 'profileImage')}
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition resize-none"
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
                    onChange={(e) => handleContentImageUpload(e, 'resumeUrl')}
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
                className="mt-3 inline-flex rounded-lg border border-violet-300 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                Open Resume
              </a>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={content?.email || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), email: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={content?.location || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), location: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
            <input
              type="url"
              value={content?.instagram || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), instagram: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={content?.linkedin || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), linkedin: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
            <input
              type="url"
              value={content?.github || ""}
              onChange={(e) => setContent({ ...(content as PortfolioContent), github: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-300 transition"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <div className="mb-1 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-gray-700">Homepage Copy Controls</label>
              <span className="text-xs text-gray-500">Grouped for mobile editing</span>
            </div>

            <details open className="rounded-lg border border-gray-200 bg-gray-50/70">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800">Header & Navigation</summary>
              <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-3">
                <input type="text" value={siteCopyForm.headerBrand} onChange={(e) => updateSiteCopyField('headerBrand', e.target.value)} disabled={!editMode} placeholder="Header Brand" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.headerHireCta} onChange={(e) => updateSiteCopyField('headerHireCta', e.target.value)} disabled={!editMode} placeholder="Header CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navHome} onChange={(e) => updateSiteCopyField('navHome', e.target.value)} disabled={!editMode} placeholder="Nav Home" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navAbout} onChange={(e) => updateSiteCopyField('navAbout', e.target.value)} disabled={!editMode} placeholder="Nav About" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navRadar} onChange={(e) => updateSiteCopyField('navRadar', e.target.value)} disabled={!editMode} placeholder="Nav Radar" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navSkills} onChange={(e) => updateSiteCopyField('navSkills', e.target.value)} disabled={!editMode} placeholder="Nav Skills" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navProjects} onChange={(e) => updateSiteCopyField('navProjects', e.target.value)} disabled={!editMode} placeholder="Nav Projects" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navHire} onChange={(e) => updateSiteCopyField('navHire', e.target.value)} disabled={!editMode} placeholder="Nav Hire" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.navContact} onChange={(e) => updateSiteCopyField('navContact', e.target.value)} disabled={!editMode} placeholder="Nav Contact" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 bg-gray-50/70">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800">Hero</summary>
              <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-2">
                <input type="text" value={siteCopyForm.heroBadge} onChange={(e) => updateSiteCopyField('heroBadge', e.target.value)} disabled={!editMode} placeholder="Hero Badge" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.heroEditorialBadge} onChange={(e) => updateSiteCopyField('heroEditorialBadge', e.target.value)} disabled={!editMode} placeholder="Hero Secondary Badge" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.heroCTA1} onChange={(e) => updateSiteCopyField('heroCTA1', e.target.value)} disabled={!editMode} placeholder="Hero CTA 1" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.heroCTA2} onChange={(e) => updateSiteCopyField('heroCTA2', e.target.value)} disabled={!editMode} placeholder="Hero CTA 2" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.heroCurrentFocusLabel} onChange={(e) => updateSiteCopyField('heroCurrentFocusLabel', e.target.value)} disabled={!editMode} placeholder="Hero Focus Label" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <textarea rows={2} value={siteCopyForm.heroCurrentFocusText} onChange={(e) => updateSiteCopyField('heroCurrentFocusText', e.target.value)} disabled={!editMode} placeholder="Hero focus text" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 bg-gray-50/70">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-800">About</summary>
              <div className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-2">
                <input type="text" value={siteCopyForm.aboutBadge} onChange={(e) => updateSiteCopyField('aboutBadge', e.target.value)} disabled={!editMode} placeholder="About Badge" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.aboutHeading} onChange={(e) => updateSiteCopyField('aboutHeading', e.target.value)} disabled={!editMode} placeholder="About Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.aboutShortCopy} onChange={(e) => updateSiteCopyField('aboutShortCopy', e.target.value)} disabled={!editMode} placeholder="About Short Copy" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <textarea rows={4} value={siteCopyForm.aboutBody2} onChange={(e) => updateSiteCopyField('aboutBody2', e.target.value)} disabled={!editMode} placeholder="About secondary paragraph" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <textarea rows={2} value={siteCopyForm.aboutFooter} onChange={(e) => updateSiteCopyField('aboutFooter', e.target.value)} disabled={!editMode} placeholder="About footer note" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-gray-700">About Highlight Tags</label>
                    <button
                      type="button"
                      onClick={() => updateSiteCopyField('aboutTags', [...siteCopyForm.aboutTags, 'New Tag'])}
                      disabled={!editMode}
                      className="inline-flex items-center gap-1 rounded-md border border-violet-300 px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                            updateSiteCopyField('aboutTags', nextTags);
                          }}
                          disabled={!editMode}
                          placeholder={`Tag ${idx + 1}`}
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextTags = siteCopyForm.aboutTags.filter((_, index) => index !== idx);
                            updateSiteCopyField('aboutTags', nextTags);
                          }}
                          disabled={!editMode || siteCopyForm.aboutTags.length <= 1}
                          className="rounded-md border border-red-300 p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                <input type="text" value={siteCopyForm.skillsHeading} onChange={(e) => updateSiteCopyField('skillsHeading', e.target.value)} disabled={!editMode} placeholder="Skills Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.projectsHeading} onChange={(e) => updateSiteCopyField('projectsHeading', e.target.value)} disabled={!editMode} placeholder="Projects Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.certificationsHeading} onChange={(e) => updateSiteCopyField('certificationsHeading', e.target.value)} disabled={!editMode} placeholder="Certifications Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.contactHeading} onChange={(e) => updateSiteCopyField('contactHeading', e.target.value)} disabled={!editMode} placeholder="Contact Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.skillsSubtitle} onChange={(e) => updateSiteCopyField('skillsSubtitle', e.target.value)} disabled={!editMode} placeholder="Skills subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.projectsSubtitle} onChange={(e) => updateSiteCopyField('projectsSubtitle', e.target.value)} disabled={!editMode} placeholder="Projects subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.certificationsSubtitle} onChange={(e) => updateSiteCopyField('certificationsSubtitle', e.target.value)} disabled={!editMode} placeholder="Certifications subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.contactSubtitle} onChange={(e) => updateSiteCopyField('contactSubtitle', e.target.value)} disabled={!editMode} placeholder="Contact subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.radarBadge} onChange={(e) => updateSiteCopyField('radarBadge', e.target.value)} disabled={!editMode} placeholder="Radar Badge" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.radarHeading} onChange={(e) => updateSiteCopyField('radarHeading', e.target.value)} disabled={!editMode} placeholder="Radar Heading" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.radarSubtitle} onChange={(e) => updateSiteCopyField('radarSubtitle', e.target.value)} disabled={!editMode} placeholder="Radar subtitle" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <input type="text" value={siteCopyForm.radarExploreSkills} onChange={(e) => updateSiteCopyField('radarExploreSkills', e.target.value)} disabled={!editMode} placeholder="Radar Skills CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.radarSeeProjects} onChange={(e) => updateSiteCopyField('radarSeeProjects', e.target.value)} disabled={!editMode} placeholder="Radar Projects CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.radarViewCredentials} onChange={(e) => updateSiteCopyField('radarViewCredentials', e.target.value)} disabled={!editMode} placeholder="Radar Credentials CTA" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />

                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <p className="mb-2 text-sm font-semibold text-gray-800">Radar Visibility</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { key: 'skill', label: 'Show Skills' },
                      { key: 'project', label: 'Show Projects' },
                      { key: 'certification', label: 'Show Certifications' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          disabled={!editMode}
                          checked={radarConfigForm.enabledKinds.includes(item.key as RadarKind)}
                          onChange={(e) => {
                            const kind = item.key as RadarKind;
                            const nextKinds = e.target.checked
                              ? Array.from(new Set([...radarConfigForm.enabledKinds, kind]))
                              : radarConfigForm.enabledKinds.filter((value) => value !== kind);
                            setRadarConfigForm((prev) => ({ ...prev, enabledKinds: nextKinds }));
                          }}
                          className="h-4 w-4"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
                  <p className="mb-2 text-sm font-semibold text-gray-800">Radar Item Limits</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <label className="text-xs font-semibold text-gray-700">
                      Max Skills
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={radarConfigForm.maxSkills}
                        disabled={!editMode}
                        onChange={(e) => setRadarConfigForm((prev) => ({ ...prev, maxSkills: Math.min(12, Math.max(1, Number(e.target.value) || 1)) }))}
                        className="mt-1 w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-700">
                      Max Projects
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={radarConfigForm.maxProjects}
                        disabled={!editMode}
                        onChange={(e) => setRadarConfigForm((prev) => ({ ...prev, maxProjects: Math.min(12, Math.max(1, Number(e.target.value) || 1)) }))}
                        className="mt-1 w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-700">
                      Max Certifications
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={radarConfigForm.maxCertifications}
                        disabled={!editMode}
                        onChange={(e) => setRadarConfigForm((prev) => ({ ...prev, maxCertifications: Math.min(12, Math.max(1, Number(e.target.value) || 1)) }))}
                        className="mt-1 w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-black"
                      />
                    </label>
                  </div>
                </div>

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
                <input type="text" value={siteCopyForm.footerBrand} onChange={(e) => updateSiteCopyField('footerBrand', e.target.value)} disabled={!editMode} placeholder="Footer Brand" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.footerQuickLinksTitle} onChange={(e) => updateSiteCopyField('footerQuickLinksTitle', e.target.value)} disabled={!editMode} placeholder="Footer Quick Links Title" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.footerServicesTitle} onChange={(e) => updateSiteCopyField('footerServicesTitle', e.target.value)} disabled={!editMode} placeholder="Footer Services Title" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <input type="text" value={siteCopyForm.footerMadeWith} onChange={(e) => updateSiteCopyField('footerMadeWith', e.target.value)} disabled={!editMode} placeholder="Footer Made With" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black" />
                <textarea rows={2} value={siteCopyForm.footerLead} onChange={(e) => updateSiteCopyField('footerLead', e.target.value)} disabled={!editMode} placeholder="Footer lead paragraph" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
                <input type="text" value={siteCopyForm.footerCopyright} onChange={(e) => updateSiteCopyField('footerCopyright', e.target.value)} disabled={!editMode} placeholder="Footer copyright line" className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-black md:col-span-2" />
              </div>
            </details>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">About Stats</label>
            <div className="grid gap-3">
              {(content?.aboutStats || DEFAULT_CONTENT_STATS).slice(0, 4).map((stat, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={stat.label || ''}
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
                    value={stat.value || ''}
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

function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    tech: "",
    github: "",
    demo: "",
    featured: false,
    category: "",
    imageUrl: "",
    youtubeUrl: "",
    youtubeTitle: "",
    codeUrl: "",
    codeName: "",
    showCode: false,
    showDetails: false,
    galleryImagesText: "",
    youtubeLinksText: "",
  });
  const [uploading, setUploading] = useState(false);

  const resetProjectForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      longDescription: "",
      tech: "",
      github: "",
      demo: "",
      featured: false,
      category: "",
      imageUrl: "",
      youtubeUrl: "",
      youtubeTitle: "",
      codeUrl: "",
      codeName: "",
      showCode: false,
      showDetails: false,
      galleryImagesText: "",
      youtubeLinksText: "",
    });
    setEditingProjectId(null);
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await adminAPI.getProjects();
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and description are required");
      return;
    }
    if (!formData.imageUrl) {
      alert("Please upload an image first");
      return;
    }

    const galleryImages = parseUrlList(formData.galleryImagesText);
    const youtubeLinks = normalizeYouTubeUrlList(parseUrlList(formData.youtubeLinksText));
    const youtubeUrl = normalizeYouTubeUrl(formData.youtubeUrl);

    const newProject = {
      title: formData.title,
      description: formData.description,
      longDescription: formData.longDescription,
      tech: formData.tech.split(",").map((t) => t.trim()).filter((t) => t),
      github: formData.github,
      demo: formData.demo,
      featured: formData.featured,
      category: formData.category,
      image: formData.imageUrl,
      youtubeUrl,
      youtubeTitle: formData.youtubeTitle,
      codeUrl: formData.codeUrl,
      codeName: formData.codeName,
      showCode: formData.showCode,
      showDetails: formData.showDetails,
      galleryImages,
      youtubeLinks,
    };

    try {
      const res = editingProjectId
        ? await adminAPI.updateProject(editingProjectId, {
            title: formData.title,
            description: formData.description,
            longDescription: formData.longDescription,
            imageUrl: formData.imageUrl,
            techStack: formData.tech.split(",").map((t) => t.trim()).filter((t) => t),
            githubUrl: formData.github,
            demoUrl: formData.demo,
            category: formData.category,
            featured: formData.featured,
            youtubeUrl,
            youtubeTitle: formData.youtubeTitle,
            codeUrl: formData.codeUrl,
            codeName: formData.codeName,
            showCode: formData.showCode,
            showDetails: formData.showDetails,
            galleryImages,
            youtubeLinks,
          })
        : await adminAPI.createProject(newProject);
      if (res.success) {
        alert(editingProjectId ? "Project updated successfully!" : "Project added successfully!");
        resetProjectForm();
        setShowForm(false);
        loadProjects();
      } else {
        const error = res.error ? ` ${res.error}` : '';
        alert(`Failed to ${editingProjectId ? 'update' : 'add'} project.${error}`);
        console.error('Project creation failed:', res);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add project'}`);
      console.error('Project creation error:', error);
    }
  };

  const handleEditProject = (project: Project) => {
    setFormData({
      title: project.title || "",
      description: project.description || "",
      longDescription: project.longDescription || "",
      tech: Array.isArray(project.tech) ? project.tech.join(", ") : "",
      github: project.github || "",
      demo: project.demo || "",
      featured: Boolean(project.featured),
      category: project.category || "",
      imageUrl: project.image || "",
      youtubeUrl: project.youtubeUrl || "",
      youtubeTitle: project.youtubeTitle || "",
      codeUrl: project.codeUrl || "",
      codeName: project.codeName || "",
      showCode: Boolean(project.showCode),
      showDetails: Boolean(project.showDetails),
      galleryImagesText: (project.galleryImages || []).join("\n"),
      youtubeLinksText: (project.youtubeLinks || []).join("\n"),
    });
    setEditingProjectId(project.id);
    setShowForm(true);
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

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploads = await Promise.all(files.map((file) => adminAPI.uploadToCloudinary(file)));
      const uploadedUrls = uploads
        .filter((res) => res.success)
        .map((res) => res.fileUrl || res.imageUrl)
        .filter((url): url is string => Boolean(url));

      if (uploadedUrls.length > 0) {
        const currentGallery = parseUrlList(formData.galleryImagesText);
        const nextGallery = Array.from(new Set([...currentGallery, ...uploadedUrls]));
        setFormData({ ...formData, galleryImagesText: nextGallery.join('\n') });
        alert(`Uploaded ${uploadedUrls.length} gallery image(s) successfully!`);
      } else {
        alert('Failed to upload gallery image(s)');
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      alert('Error uploading gallery image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const nextGallery = removeAtIndex(parseUrlList(formData.galleryImagesText), indexToRemove);
    setFormData({ ...formData, galleryImagesText: nextGallery.join('\n') });
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const res = await adminAPI.deleteProject(projectId);
      if (res.success) {
        alert("Project deleted!");
        loadProjects();
      } else {
        alert("Failed to delete project");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Projects</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (showForm) {
              resetProjectForm();
              setShowForm(false);
            } else {
              setShowForm(true);
            }
          }}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Close Form" : "Add Project"}
        </motion.button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <input
            type="text"
            placeholder="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <textarea
            placeholder="Project Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition resize-none"
          />
          <input
            type="text"
            placeholder="Tech Stack (comma-separated)"
            value={formData.tech}
            onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <input
            type="text"
            placeholder="GitHub URL"
            value={formData.github}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <input
            type="text"
            placeholder="Demo URL"
            value={formData.demo}
            onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black file:bg-violet-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md file:cursor-pointer hover:border-violet-400 transition"
              />
              {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            {formData.imageUrl && (
              <div className="mt-2">
                <Image 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  width={128}
                  height={96}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Image uploaded</p>
              </div>
            )}
          </div>
          <textarea
            placeholder="Long Description (full details)"
            value={formData.longDescription}
            onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition resize-none"
          />
          <input
            type="text"
            placeholder="YouTube URL (optional)"
            value={formData.youtubeUrl}
            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <input
            type="text"
            placeholder="YouTube Title"
            value={formData.youtubeTitle}
            onChange={(e) => setFormData({ ...formData, youtubeTitle: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <div className="space-y-2 rounded-lg border border-violet-100 bg-violet-50/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">Gallery Images (optional)</label>
              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-violet-700">
                {parseUrlList(formData.galleryImagesText).length} selected
              </span>
            </div>
            <p className="text-xs text-gray-500">Paste one URL per line or upload multiple images and they will be appended.</p>
            <textarea
              placeholder="https://...\nhttps://..."
              value={formData.galleryImagesText}
              onChange={(e) => setFormData({ ...formData, galleryImagesText: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition resize-none"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImageUpload}
              disabled={uploading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {parseUrlList(formData.galleryImagesText).map((imageUrl, index) => (
                <span key={`${imageUrl}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs text-violet-700">
                  <span className="max-w-32 truncate">Image {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold hover:bg-violet-100"
                    title="Remove image"
                  >
                    Remove
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-violet-100 bg-violet-50/50 p-3">
            <label className="block text-sm font-medium text-gray-700">More YouTube Links (optional)</label>
            <textarea
              placeholder="Paste any YouTube link: watch, youtu.be, embed, or shorts"
              value={formData.youtubeLinksText}
              onChange={(e) => setFormData({ ...formData, youtubeLinksText: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition resize-none"
            />
            <p className="text-xs text-gray-600">{normalizeYouTubeUrlList(parseUrlList(formData.youtubeLinksText)).length} extra video link(s) ready</p>
          </div>
          <input
            type="text"
            placeholder="Code URL (optional)"
            value={formData.codeUrl}
            onChange={(e) => setFormData({ ...formData, codeUrl: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <input
            type="text"
            placeholder="Code Label (e.g., 'View Code', 'GitHub Repo')"
            value={formData.codeName}
            onChange={(e) => setFormData({ ...formData, codeName: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showCode}
                onChange={(e) => setFormData({ ...formData, showCode: e.target.checked })}
                className="w-4 h-4 accent-violet-600"
              />
              <span className="text-sm text-gray-700 font-medium">Show Code Section</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showDetails}
                onChange={(e) => setFormData({ ...formData, showDetails: e.target.checked })}
                className="w-4 h-4 accent-violet-600"
              />
              <span className="text-sm text-gray-700 font-medium">Show Details Section</span>
            </label>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 accent-violet-600"
            />
            <span className="text-sm text-gray-700 font-medium">Featured</span>
          </label>
          <button
            onClick={handleAddProject}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {editingProjectId ? "Update Project" : "Add Project"}
          </button>
          {editingProjectId && (
            <button
              type="button"
              onClick={() => {
                resetProjectForm();
                setShowForm(false);
              }}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel Editing
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          projects.map((project: Project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hover:border-violet-300"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.category}</p>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{project.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-violet-50 px-2 py-1 text-violet-700">{project.featured ? 'Featured' : 'Regular'}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">Details: {project.showDetails ? 'On' : 'Off'}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">Code: {project.showCode ? 'On' : 'Off'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditProject(project)} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit Project">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                </button>
                <button onClick={() => handleDeleteProject(project.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function SkillsTab() {
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
  });

  const resetSkillForm = useCallback(() => {
    setFormData({ title: "", description: "", proficiency: 75, icon: SKILL_LOGO_PRESETS[0].url, featured: false });
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
          })
        : await adminAPI.createSkill({
            title: formData.title,
            description: formData.description,
            proficiency: formData.proficiency,
            iconName: formData.icon,
            featured: formData.featured,
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Skills</h2>
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
          className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Close Form" : "Add Skill"}
        </motion.button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <input
            type="text"
            placeholder="Skill Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
          />
          <textarea
            placeholder="Skill Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition resize-none"
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Proficiency: {formData.proficiency}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.proficiency}
              onChange={(e) => setFormData({ ...formData, proficiency: parseInt(e.target.value) })}
              className="w-full accent-violet-600"
            />
          </div>
          <div className="space-y-2 rounded-lg border border-violet-100 bg-violet-50/40 p-3">
            <label className="text-sm font-medium text-gray-700 block">Skill Logo (choose one)</label>
            <input
              type="text"
              placeholder="Search logos by name or category"
              value={logoQuery}
              onChange={(e) => setLogoQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
            <p className="text-xs text-gray-500">Showing {visibleLogoPresets.length} of {filteredLogoPresets.length} logos</p>
            {selectedLogo && <p className="text-xs text-gray-600">Selected: <span className="font-semibold">{selectedLogo.name}</span> ({selectedLogo.category})</p>}
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
          <button
            onClick={handleAddSkill}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {editingSkillId ? "Update Skill" : "Add Skill"}
          </button>
          {editingSkillId && (
            <button
              type="button"
              onClick={() => {
                resetSkillForm();
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
          skills.map((skill: Skill) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {resolveSkillIconUrl(skill.icon) ? (
                    <div
                      role="img"
                      aria-label={skill.title}
                      className="h-6 w-6 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${resolveSkillIconUrl(skill.icon)})` }}
                    />
                  ) : (
                    <span className="text-lg">🛠️</span>
                  )}
                  <h3 className="font-semibold text-gray-800">{skill.title}</h3>
                  {skill.featured && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">Featured</span>}
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

function MessagesTab({ inboxType }: { inboxType: 'contact' | 'hire' }) {
  const [activeInbox, setActiveInbox] = useState<"contact" | "hire">("contact");
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [selectedHire, setSelectedHire] = useState<HireRequest | null>(null);

  useEffect(() => {
    loadInbox();
  }, []);

  useEffect(() => {
    setActiveInbox(inboxType);
  }, [inboxType]);

  const loadInbox = async () => {
    try {
      const [contactRes, hireRes] = await Promise.all([
        adminAPI.getMessages(),
        adminAPI.getHireRequests(),
      ]);

      if (contactRes.success) {
        setContactMessages(contactRes.messages || []);
      }

      if (hireRes.success) {
        setHireRequests(hireRes.hireRequests || []);
      }
    } catch (error) {
      console.error('Error loading inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return 'Unknown time';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const openContactMessage = async (message: ContactMessage) => {
    setSelectedContact(message);
    if (!message.read) {
      const res = await adminAPI.updateMessage(message.id, true);
      if (res.success) {
        setContactMessages((prev) => prev.map((item) => item.id === message.id ? { ...item, read: true } : item));
        setSelectedContact({ ...message, read: true });
      }
    }
  };

  const openHireRequest = async (request: HireRequest) => {
    setSelectedHire(request);
    if (!request.read) {
      const res = await adminAPI.updateHireRequest(request.id, true);
      if (res.success) {
        setHireRequests((prev) => prev.map((item) => item.id === request.id ? { ...item, read: true } : item));
        setSelectedHire({ ...request, read: true });
      }
    }
  };

  const toggleContactRead = async (message: ContactMessage) => {
    const res = await adminAPI.updateMessage(message.id, !message.read);
    if (!res.success) {
      alert(res.error || 'Failed to update message');
      return;
    }

    setContactMessages((prev) => prev.map((item) => item.id === message.id ? { ...item, read: !message.read } : item));
    if (selectedContact?.id === message.id) {
      setSelectedContact({ ...message, read: !message.read });
    }
  };

  const toggleHireRead = async (request: HireRequest) => {
    const res = await adminAPI.updateHireRequest(request.id, !request.read);
    if (!res.success) {
      alert(res.error || 'Failed to update hire request');
      return;
    }

    setHireRequests((prev) => prev.map((item) => item.id === request.id ? { ...item, read: !request.read } : item));
    if (selectedHire?.id === request.id) {
      setSelectedHire({ ...request, read: !request.read });
    }
  };

  const deleteContactMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;
    const res = await adminAPI.deleteMessage(messageId);
    if (res.success) {
      setContactMessages((prev) => prev.filter((item) => item.id !== messageId));
      if (selectedContact?.id === messageId) setSelectedContact(null);
      return;
    }
    alert(res.error || 'Failed to delete message');
  };

  const deleteHireRequest = async (requestId: string) => {
    if (!confirm('Delete this hire request?')) return;
    const res = await adminAPI.deleteHireRequest(requestId);
    if (res.success) {
      setHireRequests((prev) => prev.filter((item) => item.id !== requestId));
      if (selectedHire?.id === requestId) setSelectedHire(null);
      return;
    }
    alert(res.error || 'Failed to delete hire request');
  };

  const buildContactReplyLink = (message: ContactMessage) => {
    const fullName = `${message.firstName || ''} ${message.lastName || ''}`.trim() || 'there';
    const subject = `Re: ${message.subject || 'Your message'}`;
    const body = [
      `Hi ${fullName},`,
      '',
      'Thank you for reaching out.',
      '',
      'Best regards,',
      'Rahul Chakradhar',
      '',
      '--- Original Message ---',
      message.message || '',
    ].join('\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const buildHireReplyLink = (request: HireRequest) => {
    const subject = `Re: Hiring request - ${request.projectType || 'Project discussion'}`;
    const body = [
      `Hi ${request.fullName || 'there'},`,
      '',
      'Thanks for your hiring request. I reviewed the details and will reply shortly.',
      '',
      'Best regards,',
      'Rahul Chakradhar',
      '',
      '--- Request Summary ---',
      `Company: ${request.companyName || 'Not provided'}`,
      `Project Type: ${request.projectType || 'Not provided'}`,
      `Budget: ${request.budget || 'Not provided'}`,
      `Timeline: ${request.timeline || 'Not provided'}`,
      `Role: ${request.role || 'Not provided'}`,
      '',
      request.description || '',
    ].join('\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(request.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const contactUnreadCount = contactMessages.filter((message) => !message.read).length;
  const hireUnreadCount = hireRequests.filter((request) => !request.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{inboxType === 'contact' ? 'Contact Messages' : 'Hire Requests'}</h2>
          <p className="mt-1 text-sm text-gray-500">Separate contact and hiring requests with direct Gmail reply support.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveInbox('contact')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeInbox === 'contact' ? 'bg-violet-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Contact Messages ({contactMessages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveInbox('hire')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeInbox === 'hire' ? 'bg-cyan-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Hire Requests ({hireRequests.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : activeInbox === 'contact' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Unread: {contactUnreadCount}</span>
            <span>Total: {contactMessages.length}</span>
          </div>

          {contactMessages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">No contact messages yet.</div>
          ) : (
            contactMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`cursor-pointer rounded-lg border bg-white p-4 transition-colors ${message.read ? 'border-gray-200 hover:border-violet-300' : 'border-violet-300 bg-violet-50/40'}`}
                onClick={() => openContactMessage(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{message.subject}</h3>
                    <p className="text-sm text-gray-600">From: {[message.firstName, message.lastName].filter(Boolean).join(' ') || 'Unknown Sender'}</p>
                    <p className="text-sm text-gray-600">Email: {message.email}</p>
                    <p className="mt-2 text-sm text-gray-600">{(message.message || '').slice(0, 120)}{(message.message || '').length > 120 ? '...' : ''}</p>
                    <p className="mt-2 text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!message.read && <span className="rounded-full bg-violet-600 px-2 py-1 text-xs font-semibold text-white">New</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleContactRead(message); }}
                      className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      {message.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteContactMessage(message.id); }}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Unread: {hireUnreadCount}</span>
            <span>Total: {hireRequests.length}</span>
          </div>

          {hireRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">No hire requests yet.</div>
          ) : (
            hireRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`cursor-pointer rounded-lg border bg-white p-4 transition-colors ${request.read ? 'border-gray-200 hover:border-cyan-300' : 'border-cyan-300 bg-cyan-50/40'}`}
                onClick={() => openHireRequest(request)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.fullName}</h3>
                    <p className="text-sm text-gray-600">{request.companyName || 'No company provided'}</p>
                    <p className="text-sm text-gray-600">Project: {request.projectType}</p>
                    <p className="text-sm text-gray-600">Email: {request.email}</p>
                    <p className="mt-2 text-sm text-gray-600">{(request.description || '').slice(0, 120)}{(request.description || '').length > 120 ? '...' : ''}</p>
                    <p className="mt-2 text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!request.read && <span className="rounded-full bg-cyan-600 px-2 py-1 text-xs font-semibold text-white">New</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleHireRead(request); }}
                      className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      {request.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteHireRequest(request.id); }}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedContact(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedContact.subject}</h3>
                <p className="mt-1 text-sm text-gray-500">Received: {formatDate(selectedContact.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedContact(null)} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-5 w-5 text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">First Name</p><p className="text-sm text-gray-800">{selectedContact.firstName || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last Name</p><p className="text-sm text-gray-800">{selectedContact.lastName || 'Not provided'}</p></div>
                <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p><p className="break-all text-sm text-gray-800">{selectedContact.email}</p></div>
              </div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Message</p><div className="whitespace-pre-wrap rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-700">{selectedContact.message}</div></div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={() => toggleContactRead(selectedContact)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{selectedContact.read ? 'Mark Unread' : 'Mark Read'}</button>
                <a href={buildContactReplyLink(selectedContact)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"><Mail className="h-4 w-4" />Reply in Gmail</a>
                <a href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(`Re: ${selectedContact.subject || 'Your message'}`)}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Open Mail App</a>
                <button type="button" onClick={() => deleteContactMessage(selectedContact.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete Message</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedHire(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedHire.fullName}</h3>
                <p className="mt-1 text-sm text-gray-500">Received: {formatDate(selectedHire.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedHire(null)} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-5 w-5 text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Company</p><p className="text-sm text-gray-800">{selectedHire.companyName || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Project Type</p><p className="text-sm text-gray-800">{selectedHire.projectType}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p><p className="break-all text-sm text-gray-800">{selectedHire.email}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</p><p className="text-sm text-gray-800">{selectedHire.phone || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Website</p><p className="break-all text-sm text-gray-800">{selectedHire.website || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Timeline</p><p className="text-sm text-gray-800">{selectedHire.timeline || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Budget</p><p className="text-sm text-gray-800">{selectedHire.budget || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role Needed</p><p className="text-sm text-gray-800">{selectedHire.role || 'Not provided'}</p></div>
              </div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Project Description</p><div className="whitespace-pre-wrap rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-700">{selectedHire.description}</div></div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={() => toggleHireRead(selectedHire)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{selectedHire.read ? 'Mark Unread' : 'Mark Read'}</button>
                <a href={buildHireReplyLink(selectedHire)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"><Mail className="h-4 w-4" />Reply in Gmail</a>
                <a href={`mailto:${selectedHire.email}?subject=${encodeURIComponent(`Re: Hiring request - ${selectedHire.projectType || 'Project discussion'}`)}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Open Mail App</a>
                {selectedHire.website && (
                  <a href={selectedHire.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">Open Website</a>
                )}
                <button type="button" onClick={() => deleteHireRequest(selectedHire.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Users</h2>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-800">{user.email}</td>
                  <td className="px-6 py-3 text-gray-600">{user.role || "admin"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActivityTab() {
  const [activities, setActivities] = useState<Array<{id: string; action: string; timestamp?: Record<string, unknown> | string}>>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await fetch("/api/admin/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Error loading activities:", error);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.timestamp ? new Date(String(activity.timestamp)).toLocaleString() : 'N/A'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CertificationsTab() {
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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await adminAPI.uploadToCloudinary(file);
      if (res.success) {
        const uploadedUrl = res.fileUrl || res.imageUrl;
        const currentGallery = parseUrlList(formData.galleryImagesText);
        const nextGallery = Array.from(new Set([...currentGallery, uploadedUrl]));
        setFormData({ ...formData, galleryImagesText: nextGallery.join('\n') });
        alert('Gallery image uploaded successfully!');
      } else {
        alert('Failed to upload gallery image');
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      alert('Error uploading gallery image');
    } finally {
      setUploading(false);
      e.target.value = '';
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
              className="col-span-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-4 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 sm:col-span-1"
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

              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold text-slate-800">Gallery Images (optional)</label>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-cyan-700">
                    {parseUrlList(formData.galleryImagesText).length} selected
                  </span>
                </div>
                <textarea
                  placeholder="Paste one image URL per line"
                  value={formData.galleryImagesText}
                  onChange={(e) => setFormData({ ...formData, galleryImagesText: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={uploading}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {parseUrlList(formData.galleryImagesText).map((imageUrl, index) => (
                    <span key={`${imageUrl}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs text-cyan-700 shadow-sm">
                      <span className="max-w-32 truncate">Gallery {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, galleryImagesText: removeAtIndex(parseUrlList(formData.galleryImagesText), index).join('\n') })}
                        className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold hover:bg-cyan-100"
                        title="Remove image"
                      >
                        Remove
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white p-4 space-y-2">
                <label className="block text-sm font-semibold text-slate-800">More YouTube Links (optional)</label>
                <textarea
                  placeholder="Paste one YouTube URL per line"
                  value={formData.youtubeLinksText}
                  onChange={(e) => setFormData({ ...formData, youtubeLinksText: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                />
                <p className="text-xs text-slate-600">{parseUrlList(formData.youtubeLinksText).length} extra video link(s) ready</p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 accent-cyan-600"
                />
                <span className="text-sm font-medium text-slate-700">Feature this certification on the website</span>
              </div>

              <button
                onClick={handleAddCertification}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
              >
                {editingCertificationId ? 'Update Certification' : 'Add Certification'}
              </button>
              {editingCertificationId && (
                <button
                  type="button"
                  onClick={() => {
                    resetCertificationForm();
                    setShowForm(false);
                  }}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-8 text-center text-gray-500">Loading...</div>
        ) : filteredCertifications.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No certifications match your search.
          </div>
        ) : (
          filteredCertifications.map((cert: Certification) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-cyan-100 via-white to-emerald-100">
                {cert.image ? (
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/20"></div>
                {cert.featured && (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-950 shadow-md">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Featured
                  </span>
                )}
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                  {cert.issuedDate ? new Date(cert.issuedDate).getFullYear() : 'Year'}
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                    <Award className="h-4 w-4" />
                    Certification
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{cert.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">{cert.issuer}</p>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  {cert.description || 'No description added yet.'}
                </p>

                <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-500">Issued</span>
                    <span className="text-right text-slate-800">{cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-500">Expiry</span>
                    <span className="text-right text-slate-800">{cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'No expiry'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-500">Credential</span>
                    <span className="text-right text-slate-800">{cert.credentialId || 'None'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Credential
                    </a>
                  )}
                  {cert.linkedinUrl && (
                    <a
                      href={cert.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      LinkedIn
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <button onClick={() => handleEditCertification(cert)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50" title="Edit Certification">
                    <Edit2 className="h-4 w-4 text-blue-600" />
                    Edit
                  </button>
                  <button onClick={() => handleDeleteCertification(cert.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [adminEmail, setAdminEmail] = useState('Loading...');
  const [status, setStatus] = useState<string | null>(null);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [exportingMessages, setExportingMessages] = useState(false);

  useEffect(() => {
    const loadAdminEmail = async () => {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (!res.ok) {
          setAdminEmail('Unavailable');
          return;
        }
        const data = await res.json();
        setAdminEmail(data.user?.email || 'Unavailable');
      } catch {
        setAdminEmail('Unavailable');
      }
    };

    loadAdminEmail();
  }, []);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeCsvCell = (value: string) => {
    const safe = value.replace(/"/g, '""');
    return `"${safe}"`;
  };

  const exportMessagesCsv = async () => {
    setStatus(null);
    setExportingMessages(true);
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      const messages = Array.isArray(data.messages) ? data.messages : [];
      const header: string[] = ['firstName', 'lastName', 'email', 'subject', 'message', 'createdAt', 'read'];
      const rows: string[][] = messages.map((message: ContactMessage) => [
        message.firstName || '',
        message.lastName || '',
        message.email || '',
        message.subject || '',
        message.message || '',
        message.createdAt || '',
        message.read ? 'true' : 'false',
      ]);

      const csv = [header, ...rows]
        .map((row: string[]) => row.map((cell: string) => escapeCsvCell(cell)).join(','))
        .join('\n');

      const fileName = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadFile(fileName, csv, 'text/csv;charset=utf-8;');
      setStatus('Messages exported successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to export messages.');
    } finally {
      setExportingMessages(false);
    }
  };

  const exportPortfolioBackup = async () => {
    setStatus(null);
    setExportingBackup(true);
    try {
      const [contentRes, projectsRes, skillsRes, certificationsRes] = await Promise.all([
        fetch('/api/admin/content'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/skills'),
        fetch('/api/admin/certifications'),
      ]);

      const [contentData, projectsData, skillsData, certificationsData] = await Promise.all([
        contentRes.json(),
        projectsRes.json(),
        skillsRes.json(),
        certificationsRes.json(),
      ]);

      if (!contentRes.ok || !projectsRes.ok || !skillsRes.ok || !certificationsRes.ok) {
        throw new Error('Unable to export backup. Check admin API availability.');
      }

      const backupPayload = {
        exportedAt: new Date().toISOString(),
        content: contentData.content || null,
        projects: projectsData.projects || [],
        skills: skillsData.skills || [],
        certifications: certificationsData.certifications || [],
      };

      const fileName = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      downloadFile(fileName, JSON.stringify(backupPayload, null, 2), 'application/json;charset=utf-8;');
      setStatus('Portfolio backup exported successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to export backup.');
    } finally {
      setExportingBackup(false);
    }
  };

  const resetCookieConsent = () => {
    try {
      window.localStorage.removeItem('portfolio_cookie_consent');
    } catch {
      // Ignore storage errors.
    }
    document.cookie = 'cookieConsent=; path=/; max-age=0; SameSite=Lax';
    setStatus('Cookie consent reset. Banner will appear again for users.');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signed-in Admin
            </label>
            <input
              type="email"
              value={adminEmail}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              readOnly
              disabled
            />
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Download className="h-4 w-4 text-violet-600" />
              Backup & Export
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={exportPortfolioBackup}
                disabled={exportingBackup}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {exportingBackup ? 'Exporting Backup...' : 'Export Portfolio Backup (JSON)'}
              </button>
              <button
                type="button"
                onClick={exportMessagesCsv}
                disabled={exportingMessages}
                className="rounded-lg border border-violet-300 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-60"
              >
                {exportingMessages ? 'Exporting Messages...' : 'Export Messages (CSV)'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Maintenance Tools
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Admin Dashboard
              </button>
              <button
                type="button"
                onClick={resetCookieConsent}
                className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                Reset Cookie Consent State
              </button>
            </div>
          </div>

          {status && (
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {status}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
