"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePortfolioContent } from "../../PortfolioContentProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { Code, ExternalLink, Sparkles, ArrowRight, X } from "lucide-react";
import type { Project } from "@/app/lib/types";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function ProjectsWall() {
  const { content } = usePortfolioContent();
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Projects list
  const projects: Project[] = useMemo(() => {
    return [
      {
        id: "proj1",
        title: "AI Portfolio Exhibition Engine",
        description: "3D architectural portfolio exhibition room with real-time CMS control, dynamic spotlights, and theme design tokens.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
        github: "https://github.com/rahulchakradhar",
        demo: "/",
        featured: true,
        category: "AI & 3D Web",
      },
      {
        id: "proj2",
        title: "Automated AI Agent Kit",
        description: "Multi-agent automation system connecting data pipelines, BigQuery analytics, and generative AI interfaces.",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        tech: ["Python", "OpenAI", "BigQuery", "FastAPI"],
        github: "https://github.com/rahulchakradhar",
        demo: "/proof-mode",
        featured: true,
        category: "AI Systems",
      },
    ];
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Wall Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" />
            <span>EXHIBIT 07</span>
          </span>
          <span className="text-xs font-mono text-white/40">// FEATURED PROJECTS</span>
        </div>
        <div className="text-xs font-mono text-white/40">SYSTEMS GALLERY</div>
      </div>

      {/* Projects Exhibition Cards Grid */}
      <div className="my-auto space-y-6 max-w-5xl w-full">
        <div>
          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-1">
            {siteCopy.projectsHeading || "FEATURED ENGINEERING PROJECTS"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            PROJECT EXHIBIT GALLERY
          </h2>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {projects.map((proj, idx) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[var(--accent)]/60 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 border border-white/10">
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                    {proj.category}
                  </div>
                </div>

                <h3 className="text-lg font-bold font-mono text-white group-hover:text-[var(--accent)] transition-colors mb-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-white/70 font-sans leading-relaxed line-clamp-2 mb-3">
                  {proj.description}
                </p>
              </div>

              <div>
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {proj.tech.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Explicit View Details Action Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 hover:scale-105 transition-transform"
                  >
                    <span>VIEW EXHIBIT DETAILS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {proj.github && (
                      <a
                        href={proj.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="GitHub Code"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal Overlay */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[var(--accent)] bg-[#0d0f14] p-6 sm:p-8 shadow-2xl text-white">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold font-mono text-white mb-2">{selectedProject.title}</h3>
            <p className="text-sm text-white/80 leading-relaxed mb-4">{selectedProject.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedProject.tech.map((t, i) => (
                <span key={i} className="px-3 py-1 rounded-md bg-white/10 text-xs font-mono text-[var(--accent)] font-semibold">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {selectedProject.github && (
                <a
                  href={selectedProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase flex items-center gap-2"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>VIEW REPOSITORY</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>PROJECTS EXHIBITION GALLERY</span>
        </div>
        <Link href="/projects" className="hover:text-white transition-colors">
          ALL PROJECTS ROUTE →
        </Link>
      </div>
    </div>
  );
}
