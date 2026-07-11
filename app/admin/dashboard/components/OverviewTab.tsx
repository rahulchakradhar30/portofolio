"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";

export default function OverviewTab() {
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
