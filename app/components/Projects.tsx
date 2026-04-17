"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, Star } from "lucide-react";
import type { Project } from "@/app/lib/types";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

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
      <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-emerald-300 via-cyan-300 to-amber-300"></div>

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="mb-4 bg-gradient-to-r from-cyan-100 via-emerald-100 to-amber-100 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:mb-6 md:text-6xl">
            {siteCopy.projectsHeading}
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm text-slate-300 sm:text-base md:text-xl">
            {siteCopy.projectsSubtitle}
          </p>
          <div className="mx-auto mt-4 h-1 w-16 bg-gradient-to-r from-amber-300 to-cyan-300 md:mt-6 md:w-24"></div>
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 2xl:gap-8">
            {visibleProjects.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No projects found.</div>
            ) : (
              visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id || index}
                  initial={reducedMotion ? false : { opacity: 0, y: 40 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={reducedMotion ? undefined : { duration: 0.55, delay: index * 0.08 }}
                  whileHover={reducedMotion ? undefined : { y: -10 }}
                  viewport={{ once: true, amount: 0.25 }}
                  className="group overflow-hidden rounded-3xl border border-cyan-300/15 bg-slate-950/60 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-cyan-300/35 hover:shadow-[0_20px_60px_rgba(0,0,0,0.42)]"
                >
                  {/* Project Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 sm:h-52">
                    {project.image ? (
                      <Image 
                        src={project.image} 
                        alt={project.title} 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20"></div>
                    <div className="absolute top-4 left-4">
                      {project.featured && (
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium text-cyan-100">
                        {project.category || "Project"}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-5 sm:p-6">
                    <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-cyan-200 sm:text-xl">
                      {project.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-slate-300 sm:text-base">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {Array.isArray(project.tech) && project.tech.map((tech: string) => (
                          <span key={tech} className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100 sm:text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-white/10"
                      >
                        Details
                      </Link>
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
              className="inline-flex items-center rounded-full border border-cyan-300/20 bg-white/5 px-6 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-white/10"
            >
              {siteCopy.projectsViewMore}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}