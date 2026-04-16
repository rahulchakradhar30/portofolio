"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Skill } from "@/app/lib/types";
import { resolveSkillIconUrl } from "@/app/lib/skillLogoCatalog";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const res = await fetch('/api/admin/skills');
        const data = await res.json();
        if (res.ok) {
          setSkills(data.skills || []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  return (
    <main className="section-soft min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="mb-3 bg-gradient-to-r from-[#0d1b2d] to-[#0d9488] bg-clip-text text-4xl font-black text-transparent md:text-6xl">All Skills</h1>
        <p className="mb-10 text-slate-600">A complete list of technical and creative capabilities.</p>

        {loading ? (
          <div className="text-slate-500">Loading skills...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id || index}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400">
                  {resolveSkillIconUrl(skill.icon) ? (
                    <div
                      role="img"
                      aria-label={skill.title}
                      className="h-9 w-9 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${resolveSkillIconUrl(skill.icon)})` }}
                    />
                  ) : (
                    <span className="text-2xl">🛠️</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{skill.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{skill.description}</p>
                <div className="mt-4 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${skill.proficiency || 80}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-slate-500">{skill.proficiency || 80}%</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
