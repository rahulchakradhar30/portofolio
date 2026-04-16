"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, Star, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Project } from "@/app/lib/types";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useMotionPreferences } from "../components/MotionProvider";

export default function AllProjects() {
  const { reducedMotion } = useMotionPreferences();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/admin/projects');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch projects');
        }

        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch (fetchError) {
        console.error('Error fetching projects:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filterOptions = useMemo(() => {
    const categories = Array.from(new Set(projects.map((project) => project.category).filter(Boolean)));
    return ["All", "Featured", ...categories];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (filter === "All") return projects;
    if (filter === "Featured") return projects.filter((project) => project.featured);
    return projects.filter((project) => project.category === filter);
  }, [projects, filter]);

  return (
    <section className="section-surface relative min-h-screen px-4 pt-28 pb-20 sm:px-6 md:pt-32 lg:px-10">
      <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-emerald-300 via-cyan-300 to-amber-300"></div>
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          className="mb-16"
        >
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 font-semibold text-cyan-700 transition hover:border-cyan-300 hover:text-cyan-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="mb-6 bg-gradient-to-r from-[#0d1b2d] to-[#0e7490] bg-clip-text text-5xl font-black text-transparent md:text-6xl">
              All Projects
            </h1>
            <p className="mx-auto max-w-2xl text-base text-slate-700 md:text-xl">
              Explore my complete portfolio of innovative projects spanning AI, technology, content creation, and entrepreneurship
            </p>
            <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-amber-300 to-cyan-300"></div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {filterOptions.map((item) => (
              <motion.button
                key={item}
                whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  filter === item
                    ? "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md"
                    : "border border-cyan-200 bg-white text-slate-700 hover:border-cyan-400"
                }`}
              >
                {item}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-cyan-100 bg-white p-10 text-center text-slate-600 shadow-sm">
            No projects found for this filter.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id || index}
                initial={reducedMotion ? false : { opacity: 0, y: 50 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reducedMotion ? undefined : { duration: 0.8, delay: index * 0.1 }}
                whileHover={reducedMotion ? undefined : { y: -10 }}
                className="group overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
              >
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-100 to-emerald-100">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors duration-300 group-hover:bg-black/10 group-hover:opacity-100">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <Link href={`/projects/${project.id}`}>
                    <h3 className="mb-2 cursor-pointer text-xl font-bold text-slate-800 transition-colors group-hover:text-cyan-700">
                      {project.title}
                    </h3>
                  </Link>
                  <p className="mb-4 text-sm leading-relaxed text-slate-600">
                    {project.description}
                  </p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {Array.isArray(project.tech) && project.tech.slice(0, 2).map((tech) => (
                      <span key={tech} className="rounded-full bg-cyan-50 px-2 py-1 text-xs text-cyan-800">
                        {tech}
                      </span>
                    ))}
                    {Array.isArray(project.tech) && project.tech.length > 2 && (
                      <span className="rounded-full bg-cyan-50 px-2 py-1 text-xs text-cyan-800">
                        +{project.tech.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex">
                    <motion.div
                      whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 hover:text-cyan-900"
                      >
                        Details
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          className="mt-20 border-t border-cyan-100 pt-20 text-center"
        >
          <h2 className="mb-6 text-3xl font-black text-slate-900">Interested in Collaboration?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-600">
            I&apos;m always open to discussing new opportunities and innovative projects. Let&apos;s create something amazing together!
          </p>
          <motion.a
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            href="/#contact"
            className="inline-block rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            Get In Touch
          </motion.a>
        </motion.section>
      </div>
    </section>
  );
}
