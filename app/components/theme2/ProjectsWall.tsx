"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePortfolioContent } from "../PortfolioContentProvider";
import type { Project } from "@/app/lib/types";
import LoadingSkeleton from "../LoadingSkeleton";
import { FolderGit2, ArrowRight } from "lucide-react";

export default function ProjectsWall() {
  const { content, loading } = usePortfolioContent();

  const projects = useMemo<Project[]>(() => {
    if (content?.projects && content.projects.length > 0) {
      return content.projects;
    }
    return [
      {
        id: "project-1",
        title: "AI Intelligent System",
        description: "Full-stack AI platform built with Next.js, Python backend, and LLM orchestration.",
        image: "",
        tech: ["Next.js", "Python", "OpenAI", "TailwindCSS"],
        github: "https://github.com",
        demo: "https://demo.com",
        featured: true,
        category: "AI",
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,var(--accent)_0%,transparent_60%)] opacity-15 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <FolderGit2 className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // FEATURED PROJECTS
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          PROJECT EXHIBITION
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-left my-2">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Featured Projects
        </h2>
      </div>

      {/* Projects Exhibition Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-auto">
        {projects.slice(0, 3).map((proj: Project, idx: number) => (
          <motion.div
            key={proj.id || idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group relative rounded-2xl bg-[#0e1017] border border-white/15 overflow-hidden flex flex-col justify-between text-left backdrop-blur-xl shadow-2xl hover:border-[var(--accent)]/50 transition-all hover:scale-[1.02]"
          >
            {/* Project Cover Image */}
            <div className="relative w-full h-40 bg-[#141724]">
              {proj.image ? (
                <Image src={proj.image} alt={proj.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-[var(--accent)]/20">
                  <FolderGit2 className="w-10 h-10 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-transparent to-transparent" />
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-[var(--accent)] transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-white/70 line-clamp-2 mt-1 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {proj.tech && proj.tech.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                  {proj.tech.slice(0, 3).map((t: string) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono text-white/70 bg-white/10 border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* View Project Detail Route Link */}
              <div className="pt-2">
                <Link
                  href={`/projects/${proj.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[var(--accent)] hover:bg-[var(--accent-strong)] transition-all shadow-md group-hover:shadow-[0_0_15px_var(--accent)]"
                >
                  <span>View Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>PROJECTS EXHIBIT</div>
        <div className="hidden sm:block">SELECT CARD FOR DETAILS</div>
      </div>
    </div>
  );
}
