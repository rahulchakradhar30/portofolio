"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  Users,
  Activity,
  Settings as SettingsIcon,
  BarChart3,
  Award,
  Mail,
  Briefcase,
  Plus,
  Edit2,
  Globe,
  Sparkles,
  Film,
} from "lucide-react";
import AIAssistant from "@/app/components/AIAssistant";
import type { AdminUser } from "@/app/lib/types";

// Import modular tab components
import { Palette, Layers } from "lucide-react";
import SessionGuard from "./components/SessionGuard";
import ThemesTab from "./components/ThemesTab";
import GlassmorphismTab from "./components/GlassmorphismTab";
import OverviewTab from "./components/OverviewTab";
import ContentTab from "./components/ContentTab";
import ProjectsTab from "./components/ProjectsTab";
import SkillsTab from "./components/SkillsTab";
import CertificationsTab from "./components/CertificationsTab";
import MessagesTab from "./components/MessagesTab";
import UsersTab from "./components/UsersTab";
import ActivityTab from "./components/ActivityTab";
import SettingsTab from "./components/SettingsTab";
import SEOTab from "./components/SEOTab";
import AnimationsTab from "./components/AnimationsTab";
import IntroTab from "./components/IntroTab";
import ProofModeTab from "./components/ProofModeTab";


export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/admin/auth/me", { method: "GET" });
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();
        setAdminUser({
          id: data.user?.uid || "admin",
          email: data.user?.email || "",
          name: data.user?.name || "Admin",
          password_hash: "",
          role: "admin",
          status: "active",
        });
      } catch {
        router.replace("/admin/login");
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (authChecking) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--foreground)]/60">Checking admin session...</div>;
  }

  const adminTabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "content", label: "Content Copy", icon: Edit2 },
    { id: "projects", label: "Projects", icon: Plus },
    { id: "skills", label: "Skills Grid", icon: Plus },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "messages", label: "Contact Messages", icon: Mail },
    { id: "hireRequests", label: "Hire Requests", icon: Briefcase },
    { id: "intro", label: "Cinematic Intro", icon: Film },
    { id: "proofMode", label: "Proof Mode", icon: Sparkles },
    { id: "seo", label: "SEO Settings", icon: Globe },
    { id: "animations", label: "Animation Prefs", icon: Sparkles },
    { id: "themes", label: "Color Themes", icon: Palette },
    { id: "glassmorphism", label: "Glass Design", icon: Layers },
    { id: "users", label: "Admin Users", icon: Users },
    { id: "activity", label: "Audit Logs", icon: Activity },
    { id: "settings", label: "System & Media", icon: SettingsIcon },
  ];


  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <SessionGuard />
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-40 h-screen w-72 border-r-2 border-[var(--foreground)] bg-[var(--surface)] text-[var(--foreground)] shadow-[8px_0_0_0_rgba(47,36,27,0.08)] transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        initial={false}
      >
        <div className="border-b-2 border-[var(--foreground)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[var(--foreground)] bg-[var(--accent)] text-sm font-black text-white shadow-[4px_4px_0_0_rgba(47,36,27,0.14)]">
              RC
            </div>
            <span className="hidden text-lg font-black tracking-tight md:inline">Admin CMS</span>
          </div>
        </div>

        <nav className="max-h-[calc(100vh-140px)] space-y-2 overflow-y-auto p-2 md:p-4">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-sm md:text-base font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "border-[var(--foreground)] bg-[var(--accent)] text-white shadow-[4px_4px_0_0_rgba(47,36,27,0.14)]"
                    : "border-transparent bg-transparent text-[var(--foreground)]/70 hover:border-[var(--foreground)]/10 hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
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
          className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] px-3 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[4px_4px_0_0_rgba(47,36,27,0.08)] transition-transform duration-300 hover:-translate-y-0.5 md:justify-start md:px-4"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="ml-0 transition-all duration-300 md:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b-2 border-[var(--foreground)] bg-[var(--surface)]/95 p-3 backdrop-blur md:p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface-soft)] p-2 shadow-[3px_3px_0_0_rgba(47,36,27,0.08)] md:hidden"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="hidden text-right text-xs md:block md:text-sm">
              <p className="text-[var(--foreground)]/55">Logged in as</p>
              <p className="truncate font-semibold text-[var(--foreground)]">{adminUser?.email}</p>
            </div>
            <div className="h-9 w-9 flex-shrink-0 rounded-full border-2 border-[var(--foreground)] bg-[var(--accent)] shadow-[3px_3px_0_0_rgba(47,36,27,0.14)] md:h-10 md:w-10"></div>
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
          {activeTab === "intro" && <IntroTab />}
          {activeTab === "proofMode" && <ProofModeTab />}
          {activeTab === "seo" && <SEOTab />}

          {activeTab === "animations" && <AnimationsTab />}
          {activeTab === "themes" && <ThemesTab />}
          {activeTab === "glassmorphism" && <GlassmorphismTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        onContentGenerated={(generatedContent, type) => {
          console.log("Generated content:", generatedContent, "Type:", type);
        }}
      />
    </div>
  );
}
