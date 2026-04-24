"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink, Eye, Sparkles, Star } from "lucide-react";
import type { Project } from "@/app/lib/types";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

function getProjectHighlights(project: Project) {
  const source = [project.longDescription, project.details, project.description].filter(Boolean).join(" ");
  const sentences = source
    .split(/[.\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const highlights = [...sentences.slice(0, 2)];

  if (project.category) {
    highlights.push(`Category: ${project.category}`);
  }

  if (project.tech.length > 0) {
    highlights.push(`Stack: ${project.tech.slice(0, 3).join(" · ")}`);
  }

  if (project.demo) {
    highlights.push("Demo available");
  } else if (project.github) {
    highlights.push("Source available");
  }

  return highlights.filter(Boolean).slice(0, 3);
}

export default function Projects() {
  const { reducedMotion } = useMotionPreferences();
  const [projects, setProjects] = useState<Project[]>([]);
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [projectsRes, contentRes] = await Promise.all([
          fetch('/api/admin/projects'),
          fetch('/api/admin/content'),
        ]);
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data.projects || []);
        } else {
          throw new Error('Failed to fetch projects');
        }

        if (contentRes.ok) {
          const data = await contentRes.json();
          if (data.content) {
            setSiteCopy(getSiteCopy(data.content));
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error instanceof Error ? error : new Error('Failed to load projects'));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (error) throw error;

  const orderedProjects = prioritizeFeatured(projects);
  const visibleProjects = orderedProjects.slice(0, 6);
  const hasMore = orderedProjects.length > visibleProjects.length;

  return (
    <section className="section-surface relative px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute top-0 right-0 h-px w-full bg-gradient-to-l from-cyan-300 via-white/40 to-indigo-300" />

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Product showcase
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-cyan-100 via-white to-indigo-200 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-6xl">
            {siteCopy.projectsHeading}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm leading-relaxed text-slate-300 sm:text-base md:text-xl">
            {siteCopy.projectsSubtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-cyan-300 to-indigo-300 md:mt-6 md:w-24" />
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 2xl:gap-8">
            {visibleProjects.length === 0 ? (
              <div className="col-span-full text-center text-slate-400">{siteCopy.projectsEmpty}</div>
            ) : (
              visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id || index}
                  initial={reducedMotion ? false : { opacity: 0, y: 40 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={reducedMotion ? undefined : { duration: 0.55, delay: index * 0.08 }}
                  whileHover={reducedMotion ? undefined : { y: -10 }}
                  viewport={{ once: true, amount: 0.25 }}
                  className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111827]/95 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-cyan-300/30 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-400/10 via-slate-950/20 to-indigo-400/10 sm:h-52">
                    {project.image ? (
                      <Image 
                        src={project.image} 
                        alt={project.title} 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(34,211,238,0.24)_0%,rgba(99,102,241,0.16)_36%,rgba(15,23,42,0.96)_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-indigo-500/20" />
                    <div className="absolute top-4 left-4">
                      {project.featured && (
                        <span className="flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-50">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-100">
                        {project.category || "Project"}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors duration-300 group-hover:bg-black/15 group-hover:opacity-100">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <div className="space-y-4 p-5 sm:p-6">
                    <div>
                      <h3 className="text-lg font-bold text-white transition-colors group-hover:text-cyan-100 sm:text-xl">
                        {project.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                        {project.description}
                      </p>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                        Highlights
                      </div>
                      <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                        {getProjectHighlights(project).map((highlight) => (
                          <li key={highlight} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-300" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(project.tech) && project.tech.slice(0, 5).map((tech: string) => (
                        <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-1">
                      {project.showDetails !== false && (
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-[#0b0f19] transition hover:scale-[1.02]"
                        >
                          Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      )}

                      {project.demo ? (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                        >
                          Demo
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      ) : null}

                      {project.github && project.showCode !== false ? (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                        >
                          Source
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {!loading && hasMore ? (
          <div className="mt-10 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              {siteCopy.projectsViewMore}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}