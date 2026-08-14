"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../PortfolioContentProvider";
import type { StudyRoadmapItem } from "@/app/lib/types";
import LoadingSkeleton from "../LoadingSkeleton";
import { GraduationCap, Calendar } from "lucide-react";

export default function StudyRoadmapWall() {
  const { content, loading } = usePortfolioContent();

  const items = useMemo<StudyRoadmapItem[]>(() => {
    if (content?.roadmapItems && content.roadmapItems.length > 0) {
      return content.roadmapItems;
    }
    if (content?.studyRoadmap && content.studyRoadmap.length > 0) {
      return content.studyRoadmap;
    }
    return [
      {
        id: "btech",
        stage: "B.Tech in Artificial Intelligence & Machine Learning",
        institution: "Vignan's Institute of Information Technology",
        period: "2023 - 2027",
        description: "Specializing in Machine Learning algorithms, Deep Learning, Computer Vision, and Full Stack AI Software Engineering.",
        tags: ["AI/ML", "Data Structures", "Python", "Web Systems"],
        isHigherStudy: true,
      },
      {
        id: "intermediate",
        stage: "Higher Secondary (Class XII - MPC)",
        institution: "Narayana Junior College",
        period: "2021 - 2023",
        description: "Focus on Mathematics, Physics, and Chemistry.",
        tags: ["Mathematics", "Physics"],
        isHigherStudy: false,
      },
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,var(--accent)_0%,transparent_60%)] opacity-15 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <GraduationCap className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // ACADEMIC TRACK
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          ACADEMIC ROADMAP
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-left my-2">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Academic Track
        </h2>
      </div>

      {/* Spatial Timeline Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
        {items.map((item: StudyRoadmapItem, idx: number) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`p-6 rounded-2xl border text-left flex flex-col justify-between space-y-4 backdrop-blur-xl ${
              item.isHigherStudy
                ? "bg-gradient-to-br from-white/15 via-white/5 to-[var(--accent)]/20 border-[var(--accent)]/50 shadow-2xl"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/15 border border-[var(--accent)]/30">
                  STAGE 0{idx + 1}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono text-white/60">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{item.period}</span>
                </div>
              </div>

              <h3 className="mt-3 text-xl font-black text-white leading-snug">
                {item.stage}
              </h3>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-white/80">
                {item.institution}
              </p>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                {item.description}
              </p>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                {item.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-mono text-white/70 bg-white/10 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>ACADEMIC EXHIBIT</div>
        <div className="hidden sm:block">SPATIAL TIMELINE</div>
      </div>
    </div>
  );
}
