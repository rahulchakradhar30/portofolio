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
} from "lucide-react";
import AIAssistant from "@/app/components/AIAssistant";
import type { AdminUser } from "@/app/lib/types";

// Import modular tab components
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
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Checking admin session...</div>;
  }

  const adminTabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "content", label: "Content Copy", icon: Edit2 },
    { id: "projects", label: "Projects", icon: Plus },
    { id: "skills", label: "Skills Grid", icon: Plus },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "messages", label: "Contact Messages", icon: Mail },
    { id: "hireRequests", label: "Hire Requests", icon: Briefcase },
    { id: "seo", label: "SEO Settings", icon: Globe },
    { id: "animations", label: "Animation Prefs", icon: Sparkles },
    { id: "users", label: "Admin Users", icon: Users },
    { id: "activity", label: "Audit Logs", icon: Activity },
    { id: "settings", label: "System & Media", icon: SettingsIcon },
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
        className={`fixed inset-y-0 left-0 z-40 h-screen w-64 bg-[#2f241b] text-[#fffaf3] transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        initial={false}
      >
        <div className="border-b border-[#7a5f47]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#8d6b4e] to-[#b6926d] text-sm font-bold text-[#fffaf3]">
              RC
            </div>
            <span className="hidden text-lg font-bold md:inline">Admin CMS</span>
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
                className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg text-sm md:text-base transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#8d6b4e] text-[#fffaf3]"
                    : "text-[#d8cab9] hover:bg-[#3a2c21] hover:text-[#fffaf3]"
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
          className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 rounded-lg bg-[#8d6b4e] px-3 py-2 text-sm text-[#fffaf3] transition-colors hover:bg-[#7a5f47] md:justify-start md:px-4"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="ml-0 transition-all duration-300 md:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#7a5f47]/10 bg-[#fffaf3] p-3 md:p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-[#f4eadb] md:hidden"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="text-right text-xs md:text-sm">
              <p className="hidden text-[#8d6b4e] sm:block">Logged in as</p>
              <p className="truncate font-medium text-[#2f241b]">{adminUser?.email}</p>
            </div>
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#8d6b4e] to-[#b6926d] md:h-10 md:w-10"></div>
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
          {activeTab === "seo" && <SEOTab />}
          {activeTab === "animations" && <AnimationsTab />}
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
