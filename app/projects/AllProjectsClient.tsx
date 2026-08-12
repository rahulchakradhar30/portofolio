"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, Star, ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";
import type { Project } from "@/app/lib/types";
import { useMotionPreferences } from "../components/MotionProvider";
import { BackButton } from "../components/NavigationContext";

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
    <section className="relative min-h-screen bg-[var(--background)] px-4 pb-20 pt-24 text-[var(--foreground)] sm:px-6 sm:pt-28 md:pt-32 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 50 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.8 }}
          className="mb-12 sm:mb-16"
        >
          <BackButton
            fallback="/"
            className="paper-button mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold sm:mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </BackButton>

          <div className="mb-10 text-center sm:mb-12">
            <h1 className="mb-4 text-4xl font-black text-[var(--foreground)] sm:text-5xl md:mb-6 md:text-6xl">
              All Projects
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/80 sm:text-base md:text-xl">
              Explore my complete portfolio of innovative projects spanning AI, technology, content creation, and entrepreneurship
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="mb-12 flex flex-wrap justify-center gap-2 sm:gap-3">
            {filterOptions.map((item) => (
              <motion.button
                key={item}
                whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                onClick={() => setFilter(item)}
                className={`paper-button px-3 py-2 text-sm font-semibold sm:px-4 ${
                  filter === item
                    ? "paper-button-primary"
                    : ""
                }`}
              >
                {item}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="paper-card p-10 text-center text-[var(--foreground)]/70">
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
                <div className="paper-card group flex h-full flex-col overflow-hidden sm:rounded-3xl">
                  {/* Project Image */}
                  <div className="relative h-44 overflow-hidden bg-[var(--surface-soft)] sm:h-48">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                    <div className="absolute top-4 left-4 z-10">
                      {project.featured && (
                        <span className="paper-chip flex items-center bg-[var(--accent)] text-[var(--surface)] border-none">
                          <Star className="mr-1 h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <span className="paper-chip">
                        {project.category || "Project"}
                      </span>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="flex h-full flex-col p-5 sm:p-6">
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="mb-2 cursor-pointer text-lg font-bold text-[var(--foreground)] transition-colors hover:text-[var(--accent)] sm:text-xl">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="mb-4 text-sm leading-relaxed text-[var(--foreground)]/80">
                      {project.description}
                    </p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {Array.isArray(project.tech) && project.tech.slice(0, 2).map((tech) => (
                        <span key={tech} className="paper-chip">
                          {tech}
                        </span>
                      ))}
                      {Array.isArray(project.tech) && project.tech.length > 2 && (
                        <span className="paper-chip">
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
                          className="paper-button inline-flex items-center px-4 py-2 text-sm font-semibold"
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
          className="mt-16 border-t border-[var(--foreground)]/10 pt-16 text-center sm:mt-20 sm:pt-20"
        >
          <h2 className="mb-4 text-2xl font-black text-[var(--foreground)] sm:mb-6 sm:text-3xl">Interested in Collaboration?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-[var(--foreground)]/80 sm:text-xl">
            I&apos;m always open to discussing new opportunities and innovative projects. Let&apos;s create something amazing together!
          </p>
          <motion.a
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            href="/#contact"
            className="paper-button-primary inline-block px-7 py-3 text-sm font-semibold sm:px-8 sm:py-4 sm:text-base"
          >
            Get In Touch
          </motion.a>
        </motion.section>
      </div>
    </section>
  );
}
