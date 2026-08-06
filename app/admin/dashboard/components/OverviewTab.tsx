"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";

const statCardClassName =
  "paper-card p-5 shadow-none transition-transform duration-300 hover:-translate-y-1 md:p-6";

export default function OverviewTab() {
  const [stats, setStats] = useState({ projects: 0, skills: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      <div className="paper-card flex items-center gap-3 p-4 shadow-none md:p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[var(--foreground)] bg-[var(--accent)] text-white shadow-[4px_4px_0_0_rgba(47,36,27,0.12)]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] md:text-3xl">Dashboard Overview</h2>
          <p className="text-sm text-[var(--foreground)]/65">A quick summary of live admin activity and portfolio content.</p>
        </div>
      </div>
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
            className={`${statCardClassName} border-2 border-[var(--foreground)] bg-[var(--surface)] text-[var(--foreground)]`}
      } finally {
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]/55">{stat.label}</div>
            <div className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{loading ? "..." : stat.value}</div>
            <div className={`mt-4 h-2 w-24 rounded-full bg-gradient-to-r ${stat.color}`} />
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
