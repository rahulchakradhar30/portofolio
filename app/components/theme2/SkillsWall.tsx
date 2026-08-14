"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../PortfolioContentProvider";
import type { Skill } from "@/app/lib/types";
import LoadingSkeleton from "../LoadingSkeleton";
import SkillIcon from "../SkillIcon";
import { Cpu } from "lucide-react";

export default function SkillsWall() {
  const { content, loading } = usePortfolioContent();

  const skills = useMemo<Skill[]>(() => {
    if (content?.skills && content.skills.length > 0) {
      return content.skills;
    }
    return [
      { id: "react", title: "React / Next.js", description: "Frontend architecture, Server Components, SSR", proficiency: 90, icon: "Code2", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" },
      { id: "python", title: "Python / ML", description: "Machine Learning, PyTorch, Scikit-Learn", proficiency: 85, icon: "Brain", color: "#eab308", bgColor: "rgba(234, 179, 8, 0.1)" },
      { id: "typescript", title: "TypeScript", description: "Strict typing, API integration, Systems", proficiency: 88, icon: "FileCode", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" },
      { id: "ai", title: "AI Systems & LLMs", description: "Prompt engineering, RAG, OpenAI, Gemini API", proficiency: 85, icon: "Cpu", color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.1)" },
      { id: "database", title: "Firestore & Cloud", description: "NoSQL schema, Firebase Auth, GCP", proficiency: 82, icon: "Database", color: "#f97316", bgColor: "rgba(249, 115, 22, 0.1)" },
      { id: "tailwind", title: "CSS & Styling", description: "Design systems, Responsive UI, Glassmorphism", proficiency: 92, icon: "Layout", color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.1)" },
    ];
  }, [content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSkeleton variant="cards" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-6 sm:p-10 md:p-12 xl:p-16 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,var(--accent)_0%,transparent_60%)] opacity-15 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // TECHNICAL SKILLS
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          SKILL MATRIX
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-left my-2">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Skills & Technologies
        </h2>
      </div>

      {/* Skills Plaques Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-auto">
        {skills.slice(0, 6).map((skill: Skill, idx: number) => (
          <motion.div
            key={skill.id || idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--accent)]/50 hover:bg-white/10 transition-all backdrop-blur-md text-left flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] group-hover:scale-110 transition-transform">
                <SkillIcon title={skill.title} icon={skill.icon} className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-[var(--accent)]">
                {skill.proficiency || 85}%
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white group-hover:text-[var(--accent)] transition-colors">
                {skill.title}
              </h3>
              <p className="text-xs text-white/60 line-clamp-2 mt-0.5">
                {skill.description}
              </p>
            </div>

            {/* Proficiency Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-white transition-all duration-700"
                style={{ width: `${skill.proficiency || 85}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>SKILLS EXHIBIT</div>
        <div className="hidden sm:block">REAL ADMIN REGISTRY</div>
      </div>
    </div>
  );
}
