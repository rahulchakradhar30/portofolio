"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../../PortfolioContentProvider";
import { Briefcase, Calendar, MapPin, CheckCircle2, Award } from "lucide-react";

export default function ExperienceWall() {
  const { content } = usePortfolioContent();

  const experiences = content?.experiences || [
    {
      id: "exp1",
      companyName: "AI Research & Development",
      role: "Lead Full Stack & AI Developer",
      startDate: "2024",
      endDate: "Present",
      isCurrent: true,
      location: "Remote / Bengaluru",
      shortDescription: "Architecting generative AI applications, high-performance web platforms, and automated workflow pipelines.",
      skills: ["Next.js", "Python", "OpenAI", "TypeScript", "Firebase"],
      order: 1,
      visible: true,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>EXHIBIT 06</span>
          </span>
          <span className="text-xs font-mono text-white/40">// CAREER EXPERIENCES</span>
        </div>
        <div className="text-xs font-mono text-white/40">PROFESSIONAL TIMELINE</div>
      </div>

      {/* Center Body */}
      <div className="my-auto space-y-6 max-w-5xl w-full">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-1">
            WORK EXPERIENCE & INDUSTRY IMPACT
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            CAREER TIMELINE
          </h2>
        </div>

        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[var(--accent)]/50 transition-all flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-mono text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[var(--accent)]" />
                    <span>{exp.role}</span>
                  </h3>
                  <div className="text-xs font-mono text-[var(--accent)] font-semibold mt-0.5">
                    {exp.companyName}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-white/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}</span>
                  </span>
                  {exp.location && (
                    <span className="hidden sm:flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-white/40" />
                      <span>{exp.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {exp.shortDescription && (
                <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed">
                  {exp.shortDescription}
                </p>
              )}

              {exp.skills && exp.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {exp.skills.map((sk, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-mono text-white/70"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>VERIFIED INDUSTRY RECORD</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>EXHIBIT PANEL 06</span>
        </div>
      </div>
    </div>
  );
}
