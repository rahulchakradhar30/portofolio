"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../../PortfolioContentProvider";
import { GraduationCap, Calendar, CheckCircle2, Award } from "lucide-react";

export default function AcademicWall() {
  const { content } = usePortfolioContent();

  const roadmapItems = content?.studyRoadmap || [
    {
      id: "btech",
      stage: "B.Tech in Artificial Intelligence & Data Science",
      institution: "University Institute of Engineering & Technology",
      period: "2022 - 2026",
      description: "Specializing in Machine Learning, Deep Neural Networks, Cloud Computing, and Data Analytics.",
      tags: ["AI/ML", "Data Science", "Python", "Deep Learning"],
      isHigherStudy: false,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>EXHIBIT 03</span>
          </span>
          <span className="text-xs font-mono text-white/40">// ACADEMIC ROADMAP</span>
        </div>
        <div className="text-xs font-mono text-white/40">EDUCATION & METRICS</div>
      </div>

      {/* Content Body */}
      <div className="my-auto space-y-6 max-w-4xl">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-1">
            EDUCATION & QUALIFICATIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            ACADEMIC TRACK RECORD
          </h2>
        </div>

        <div className="space-y-4">
          {roadmapItems.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[var(--accent)]/50 transition-all flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <h3 className="text-lg sm:text-xl font-bold font-mono text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
                  <span>{item.stage}</span>
                </h3>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-white/70 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{item.period}</span>
                </span>
              </div>

              <div className="text-xs font-mono text-white/60">{item.institution}</div>
              <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed">{item.description}</p>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-mono text-white/70"
                    >
                      #{tag}
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
          <span>VERIFIED ACADEMIC CREDENTIALS</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>EXHIBIT PANEL 03</span>
        </div>
      </div>
    </div>
  );
}
