"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, Star, ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";
import type { Project } from "@/app/lib/types";
import { useMotionPreferences } from "../components/MotionProvider";

interface AllProjectsClientProps {
  initialProjects: Project[];
}

export default function AllProjectsClient({ initialProjects }: AllProjectsClientProps) {
  const { reducedMotion } = useMotionPreferences();
  const [projects] = useState<Project[]>(initialProjects);
  const [filter, setFilter] = useState("All");

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
    <section className="section-surface relative min-h-screen px-4 pb-20 pt-24 sm:px-6 sm:pt-28 md:pt-32 lg:px-10">
      <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-[#8d6b4e] via-[#eadbbf] to-[#c4a884]"></div>
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          className="mb-12 sm:mb-16"
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/12 bg-white px-4 py-2 text-sm font-semibold text-[#5f4a38] transition hover:border-[#8d6b4e]/30 hover:text-[#8d6b4e] sm:mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>

          <div className="mb-10 text-center sm:mb-12">
            <h1 className="mb-4 bg-gradient-to-r from-[#7a5f47] via-[#b6926d] to-[#9b7a5b] bg-clip-text text-4xl font-black text-transparent sm:text-5xl md:mb-6 md:text-6xl">
              All Projects
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#6a5846] sm:text-base md:text-xl">
              Explore my complete portfolio of innovative projects spanning AI, technology, content creation, and entrepreneurship
            </p>
            <div className="mx-auto mt-5 h-1 w-20 bg-gradient-to-r from-[#8d6b4e] to-[#c4a884] sm:mt-6 sm:w-24"></div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-12 flex flex-wrap justify-center gap-2 sm:gap-3">
            {filterOptions.map((item) => (
              <motion.button
                key={item}
                whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
                  filter === item
                    ? "bg-[#8d6b4e] text-[#fffaf3] shadow-md"
                    : "border border-[#7a5f47]/12 bg-white text-[#6a5846] hover:border-[#8d6b4e]/30"
                }`}
              >
                {item}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-[#7a5f47]/12 bg-white p-10 text-center text-[#6a5846] shadow-sm">
            No projects found for this filter.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id || index}
                initial={reducedMotion ? false : { opacity: 0, y: 50 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reducedMotion ? undefined : { duration: 0.8, delay: index * 0.1 }}
                whileHover={reducedMotion ? undefined : { y: -10 }}
                className="flex h-full"
              >
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#7a5f47]/12 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl sm:rounded-3xl">
                  {/* Project Image */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#f7efe4] to-[#eadbbf] sm:h-48">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c4a884]/16 to-[#8d6b4e]/16"></div>
                    <div className="absolute top-4 left-4">
                      {project.featured && (
                        <span className="flex items-center rounded-full bg-[#c4a884] px-3 py-1 text-xs font-bold text-[#fffaf3]">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-[#5f4a38]">
                        {project.category || "Project"}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/0 opacity-0 transition-colors duration-300 group-hover:bg-white/20 group-hover:opacity-100">
                      <Eye className="h-8 w-8 text-[#2f241b]" />
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="flex h-full flex-col p-5 sm:p-6">
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="mb-2 cursor-pointer text-lg font-bold text-[#2f241b] transition-colors group-hover:text-[#8d6b4e] sm:text-xl">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="mb-4 text-sm leading-relaxed text-[#6a5846]">
                      {project.description}
                    </p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {Array.isArray(project.tech) && project.tech.slice(0, 2).map((tech) => (
                        <span key={tech} className="rounded-full bg-[#fbf7f0] px-2 py-1 text-xs text-[#6a5846]">
                          {tech}
                        </span>
                      ))}
                      {Array.isArray(project.tech) && project.tech.length > 2 && (
                        <span className="rounded-full bg-[#fbf7f0] px-2 py-1 text-xs text-[#6a5846]">
                          +{project.tech.length - 2} more
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex">
                      <motion.div
                        whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                      >
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center rounded-full border border-[#7a5f47]/12 bg-white px-4 py-2 text-sm font-semibold text-[#5f4a38] transition-colors hover:bg-[#f7efe4] hover:text-[#8d6b4e]"
                        >
                          Details
                        </Link>
                      </motion.div>
                    </div>
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
          className="mt-16 border-t border-[#7a5f47]/10 pt-16 text-center sm:mt-20 sm:pt-20"
        >
          <h2 className="mb-4 text-2xl font-black text-[#2f241b] sm:mb-6 sm:text-3xl">Interested in Collaboration?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-[#6a5846] sm:text-xl">
            I&apos;m always open to discussing new opportunities and innovative projects. Let&apos;s create something amazing together!
          </p>
          <motion.a
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            href="/#contact"
            className="inline-block rounded-full bg-[#8d6b4e] px-7 py-3 text-sm font-semibold text-[#fffaf3] shadow-lg transition-all duration-300 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
          >
            Get In Touch
          </motion.a>
        </motion.section>
      </div>
    </section>
  );
}
