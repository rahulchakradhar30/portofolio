"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, Star } from "lucide-react";
import type { Project } from "@/app/lib/types";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";

export default function Projects() {
  const { reducedMotion } = useMotionPreferences();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/admin/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        } else {
          throw new Error('Failed to fetch projects');
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

  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects = (featuredProjects.length > 0 ? featuredProjects : projects).slice(0, 6);
  const hasMore = (featuredProjects.length > 0 ? featuredProjects.length : projects.length) > visibleProjects.length;

  return (
    <section className="section-surface relative px-4 py-16 sm:px-6 md:py-24 lg:px-10">
      <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-emerald-300 via-cyan-300 to-amber-300"></div>

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 bg-gradient-to-r from-[#0d1b2d] to-[#0e7490] bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            Featured Projects
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-700 md:text-xl">
            A showcase of my recent work, blending creativity with cutting-edge technology
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-amber-300 to-cyan-300"></div>
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:gap-8">
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
                  className="group overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Project Image */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-cyan-100 to-emerald-100">
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
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
                        {project.category || "Project"}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-slate-800 transition-colors group-hover:text-cyan-700">
                      {project.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-slate-600">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {Array.isArray(project.tech) && project.tech.map((tech: string) => (
                        <span key={tech} className="rounded-full bg-cyan-50 px-3 py-1 text-sm text-cyan-800">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
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
              className="inline-flex items-center rounded-full border border-cyan-200 bg-white px-6 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              View More Projects
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}