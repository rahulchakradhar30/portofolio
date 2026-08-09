"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink, Eye, Sparkles, Star } from "lucide-react";
import type { Project } from "@/app/lib/types";
import { prioritizeFeatured } from "@/app/lib/contentOrdering";
import LoadingSkeleton from "./LoadingSkeleton";
import ExpandableSection from "./ExpandableSection";
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

import { usePortfolioContent } from "./PortfolioContentProvider";

export default function Projects() {
  const { content, loading: contentLoading, error: contentError } = usePortfolioContent();
  const { reducedMotion, getAnimation } = useMotionPreferences();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const sectionAnim = useMemo(() => getAnimation("projects"), [getAnimation]);

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);
  const isVisible = content ? content.sectionVisibility?.projects !== false : true;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRes = await fetch('/api/admin/projects');
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data.projects || []);
        } else {
          throw new Error('Failed to fetch projects');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err : new Error('Failed to load projects'));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if ((loading || contentLoading) && isVisible) {
    return (
      <section className="relative px-4 py-24 sm:px-6 lg:px-10">
        <LoadingSkeleton variant="cards" />
      </section>
    );
  }
  if (!isVisible) return null;

  const orderedProjects = prioritizeFeatured(projects);
  const visibleProjects = orderedProjects.slice(0, 6);

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:py-32 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={sectionAnim.variants.initial}
          whileInView={sectionAnim.variants.whileInView || sectionAnim.variants.animate}
          transition={sectionAnim.variants.transition}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16 text-center"
        >
          <div className="paper-chip mx-auto mb-6 inline-flex uppercase tracking-[0.24em] gap-2">
            <Sparkles className="h-4 w-4" />
            Product showcase
          </div>
          <h2 className="mb-6 text-4xl font-black md:text-6xl tracking-tighter text-[var(--foreground)]">
            {siteCopy.projectsHeading}
          </h2>
          <p className="mx-auto max-w-2xl text-lg md:text-xl font-medium">
            {siteCopy.projectsSubtitle}
          </p>
          <div className="mx-auto mt-8 h-1 w-24 bg-[var(--foreground)] editorial-border rounded-full" />
        </motion.div>

        {loading ? (
          <LoadingSkeleton variant="cards" count={6} />
        ) : (
          <ExpandableSection collapsedMaxHeightPx={860}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8 2xl:gap-10">
              {visibleProjects.length === 0 ? (
                <div className="col-span-full text-center font-bold text-lg">{siteCopy.projectsEmpty}</div>
              ) : (
                visibleProjects.map((project, index) => {
                  const cardAnim = getAnimation("projects", project.id);
                  return (
                    <motion.div
                      key={project.id || index}
                      initial={cardAnim.variants.initial}
                      whileInView={cardAnim.variants.whileInView || cardAnim.variants.animate}
                      transition={{
                        ...cardAnim.variants.transition,
                        delay: (cardAnim.params.delay || 0) + index * (cardAnim.params.staggerStep || 0.05),
                      }}
                      whileHover={reducedMotion ? undefined : { y: -6, scale: 1.01 }}
                      viewport={{ once: true, amount: 0.2 }}
                      className="paper-card group overflow-hidden"
                    >
                    <div className="relative h-48 overflow-hidden bg-[var(--surface-soft)] sm:h-56 border-b-2 border-[var(--foreground)]">
                      {project.image ? (
                        <Image 
                          src={project.image} 
                          alt={project.title} 
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[var(--surface-strong)] flex items-center justify-center">
                          <span className="font-bold text-xl text-[var(--foreground)] opacity-20">No Image</span>
                        </div>
                      )}
                      
                      {project.featured && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="paper-chip flex items-center bg-[var(--surface)] font-bold text-xs">
                            <Star className="mr-1.5 h-3.5 w-3.5" />
                            Featured
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 z-10">
                        <span className="paper-chip bg-[var(--surface)] text-xs font-bold">
                          {project.category || "Project"}
                        </span>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-strong)]/80 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                        <div className="paper-card rounded-full p-4 transition-transform duration-300 group-hover:scale-110 bg-[var(--surface)]">
                          <Eye className="h-6 w-6 text-[var(--foreground)]" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-6 sm:p-8">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)]">
                          {project.title}
                        </h3>
                        <p className="mt-3 text-base font-medium leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <div>
                        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                          Highlights
                        </div>
                        <ul className="space-y-2 text-sm font-semibold leading-relaxed">
                          {getProjectHighlights(project).map((highlight) => (
                            <li key={highlight} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(project.tech) && project.tech.slice(0, 5).map((tech: string) => (
                          <span key={tech} className="paper-chip px-3 py-1.5 text-xs font-bold bg-[var(--surface-soft)]">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        {project.showDetails !== false && (
                          <Link
                            href={`/projects/${project.id}`}
                            className="paper-button-primary text-sm px-5 py-2.5"
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
                            className="paper-button text-sm px-5 py-2.5"
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
                            className="paper-button text-sm px-5 py-2.5"
                          >
                            Source
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })
              )}
            </div>
          </ExpandableSection>
        )}
      </div>
    </section>
  );
}