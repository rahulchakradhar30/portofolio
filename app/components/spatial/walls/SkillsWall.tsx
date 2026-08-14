"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../../PortfolioContentProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { Code, Sparkles, Cpu, CheckCircle } from "lucide-react";
import SkillIcon from "../../SkillIcon";

export default function SkillsWall() {
  const { content } = usePortfolioContent();
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const skills = content?.homepageConfig?.sections?.find((s) => s.id === "skills") ? (
    // Consume skills from provider/content
    content.homepageConfig.sections.find((s) => s.id === "skills")
  ) : null;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Wall Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" />
            <span>EXHIBIT 05</span>
          </span>
          <span className="text-xs font-mono text-white/40">// TECHNICAL CAPABILITIES</span>
        </div>
        <div className="text-xs font-mono text-white/40">SKILLS MATRIX</div>
      </div>

      {/* Center Skills Display */}
      <div className="my-auto space-y-6 max-w-5xl w-full">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-1">
            {siteCopy.skillsHeading || "TECHNICAL SKILLS & EXPERTISE"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            TECHNOLOGY STACK & TOOLS
          </h2>
        </div>

        {/* Categories / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {[
            { name: "Python / PyTorch", cat: "AI & ML", level: 92, icon: "Code" },
            { name: "Next.js / React", cat: "Frontend", level: 95, icon: "Layout" },
            { name: "TypeScript / Node", cat: "Backend", level: 90, icon: "Server" },
            { name: "Firebase / GCP", cat: "Cloud & Data", level: 88, icon: "Cloud" },
            { name: "Tailwind CSS", cat: "UI/UX", level: 94, icon: "Sparkles" },
            { name: "Docker / Git", cat: "DevOps", level: 85, icon: "Cpu" },
            { name: "OpenAI API", cat: "GenAI", level: 90, icon: "Sparkles" },
            { name: "REST / GraphQL", cat: "APIs", level: 92, icon: "Database" },
          ].map((skill, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[var(--accent)]/50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[var(--accent)] font-bold uppercase tracking-wider">
                  {skill.cat}
                </span>
                <SkillIcon title={skill.name} icon={skill.icon} className="w-4 h-4 text-white/50" />
              </div>
              <h3 className="text-sm font-bold font-mono text-white mb-2">{skill.name}</h3>

              {/* Proficiency Bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full rounded-full transition-all duration-700"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>REAL-TIME SKILL PROFILE</span>
        </div>
        <div className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>EXHIBIT PANEL 05</span>
        </div>
      </div>
    </div>
  );
}
