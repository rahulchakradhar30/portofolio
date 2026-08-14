"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../PortfolioContentProvider";
import type { ExperienceItem } from "@/app/lib/types";
import LoadingSkeleton from "../LoadingSkeleton";
import { Briefcase, Calendar, MapPin } from "lucide-react";

export default function ExperienceWall() {
  const { content, loading } = usePortfolioContent();

  const experiences = useMemo<ExperienceItem[]>(() => {
    if (content?.experiences && content.experiences.length > 0) {
      return content.experiences;
    }
    return [
      {
        id: "exp-1",
        companyName: "AI Product Engineering Lab",
        role: "Full Stack AI Developer Intern",
        employmentType: "Internship",
        startDate: "2024",
        endDate: "Present",
        isCurrent: true,
        location: "Remote",
        workMode: "Hybrid",
        shortDescription: "Architecting generative AI tools, dynamic UI components, and full-stack web products.",
        achievements: ["Engineered responsive AI application UI", "Integrated LLM streaming APIs"],
        skills: ["Next.js", "TypeScript", "OpenAI", "Firebase"],
        order: 1,
        visible: true,
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent)_0%,transparent_60%)] opacity-15 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <Briefcase className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // WORK EXPERIENCE
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          CAREER TRACK
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-left my-2">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Work Experience
        </h2>
      </div>

      {/* Experience Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
        {experiences.slice(0, 2).map((exp: ExperienceItem, idx: number) => (
          <motion.div
            key={exp.id || idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-[var(--accent)]/15 border border-white/15 backdrop-blur-xl shadow-2xl text-left flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/15 border border-[var(--accent)]/30">
                  {exp.employmentType || "Role"}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono text-white/60">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{exp.startDate} - {exp.endDate || "Present"}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                {exp.companyLogo ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-white/20 bg-black">
                    <Image src={exp.companyLogo} alt={exp.companyName} fill className="object-cover" />
                  </div>
                ) : null}
                <div>
                  <h3 className="text-xl font-black text-white">{exp.role}</h3>
                  <p className="text-sm font-semibold text-white/80">{exp.companyName}</p>
                </div>
              </div>

              {exp.location && (
                <div className="mt-2 flex items-center gap-1 text-xs font-mono text-white/50">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{exp.location} {exp.workMode ? `(${exp.workMode})` : ""}</span>
                </div>
              )}

              {exp.shortDescription && (
                <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed">
                  {exp.shortDescription}
                </p>
              )}
            </div>

            {exp.skills && exp.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                {exp.skills.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 rounded text-[10px] font-mono text-white/70 bg-white/10 border border-white/10">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>EXPERIENCE EXHIBIT</div>
        <div className="hidden sm:block">REAL ADMIN RECORDS</div>
      </div>
    </div>
  );
}
