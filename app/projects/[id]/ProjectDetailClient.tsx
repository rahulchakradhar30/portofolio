"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Code, GitBranch, Play } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/app/lib/types";
import ImageLightbox from "@/app/components/ImageLightbox";
import { getYouTubeEmbedUrl } from "@/app/lib/youtube";
import { BackButton } from "@/app/components/NavigationContext";

interface ProjectDetailClientProps {
  project: Project;
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"details" | "code">("details");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images.filter(Boolean));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const youtubeEmbedUrl = project.youtubeUrl ? getYouTubeEmbedUrl(project.youtubeUrl) : null;
  const extraYouTubeEmbedUrls = (project.youtubeLinks || [])
    .map((link) => getYouTubeEmbedUrl(link))
    .filter((embedUrl): embedUrl is string => Boolean(embedUrl));

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 pt-20 md:pt-28">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[var(--surface-strong)]/30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[var(--surface-soft)]/50 blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 md:px-8 lg:px-10 2xl:px-16">
        {/* Header */}
        <BackButton
          fallback="/projects"
          className="paper-button mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold sm:mb-8"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          Back
        </BackButton>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 sm:mb-20"
        >
          <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12 2xl:gap-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative"
            >
              {project.image ? (
                <div className="relative group">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--surface-strong)] to-[var(--surface-soft)] blur-2xl opacity-50 transition duration-300 group-hover:opacity-75"></div>
                  <button
                    type="button"
                    onClick={() => openLightbox([project.image || ""], 0)}
                    className="relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl"
                    title="Click to view full image"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={600}
                      height={400}
                      className="relative h-auto w-full rounded-2xl object-cover shadow-2xl sm:rounded-3xl"
                    />
                  </button>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--surface-strong)] to-[var(--surface-soft)] shadow-2xl sm:rounded-3xl">
                  <div className="text-2xl font-bold text-[var(--foreground)] opacity-30 md:text-6xl">
                    {project.category}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-5 sm:space-y-6"
            >
              <div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="paper-chip mb-4 inline-block px-4 py-2 text-sm font-semibold"
                >
                  {project.category}
                </motion.span>
                <h1 className="mb-4 text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-4xl md:mb-6 md:text-6xl">
                  {project.title}
                </h1>
              </div>

              <p className="text-base leading-relaxed text-[var(--foreground)]/80 sm:text-lg md:text-xl">
                {project.description}
              </p>

              {/* Tech Stack */}
              {project.tech && project.tech.length > 0 && (
                <div>
                  <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Technologies</div>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech: string) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="paper-chip px-3 py-2 text-sm font-medium"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 sm:pt-6">
                {project.demo && (
                  <motion.a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="paper-button-primary inline-flex items-center gap-2 px-5 py-3 font-semibold sm:px-6"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Live Demo
                  </motion.a>
                )}
                {project.github && (
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="paper-button inline-flex items-center gap-2 px-5 py-3 font-semibold sm:px-6"
                  >
                    <GitBranch className="w-5 h-5" />
                    GitHub
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* YouTube Video Section */}
        {project.youtubeUrl ? (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 sm:mb-20"
          >
            <div className="paper-card overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--surface-strong)] to-[var(--surface-soft)] px-5 py-5 sm:px-6 md:px-8 md:py-6">
                <h2 className="flex items-center gap-3 text-xl font-bold text-[var(--foreground)] sm:text-2xl md:text-3xl">
                  <Play className="h-6 w-6 rounded-full bg-[var(--surface)] p-1 sm:h-7 sm:w-7 sm:p-1.5 text-[var(--accent)]" />
                  {project.youtubeTitle || "Project Video"}
                </h2>
              </div>

              {youtubeEmbedUrl ? (
                <div className="aspect-video w-full bg-[var(--surface-soft)]">
                  <iframe
                    className="h-full w-full"
                    src={youtubeEmbedUrl}
                    title={project.youtubeTitle || "Project Video"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex min-h-[280px] items-center justify-center px-6 py-10 text-center sm:min-h-[360px]">
                  <div className="max-w-lg space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--foreground)]/20">
                      <Play className="h-7 w-7 text-[var(--accent)]" />
                    </div>
                    <p className="text-base text-[var(--foreground)]/80 sm:text-lg">
                      The YouTube link is present, but the video preview could not be embedded from this URL format.
                    </p>
                    <a
                      href={project.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="paper-button-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Video on YouTube
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        ) : null}

        {project.galleryImages && project.galleryImages.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 sm:mb-20"
          >
            <div className="paper-card p-5 sm:p-6 md:p-8">
              <h2 className="mb-5 text-xl font-bold text-[var(--foreground)] sm:mb-6 sm:text-2xl md:text-3xl">Project Gallery</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                {project.galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => openLightbox(project.galleryImages || [], index)}
                    className="relative h-40 overflow-hidden rounded-2xl border border-[var(--foreground)]/20 bg-[var(--surface-soft)] sm:h-48"
                    title="Click to open and zoom"
                  >
                    <Image src={image} alt={`${project.title} gallery ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {extraYouTubeEmbedUrls.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 sm:mb-20"
          >
            <div className="paper-card p-5 sm:p-6 md:p-8">
              <h2 className="mb-5 text-xl font-bold text-[var(--foreground)] sm:mb-6 sm:text-2xl md:text-3xl">More Videos</h2>
              <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
                {extraYouTubeEmbedUrls.map((embedUrl, index) => (
                  <div key={`${embedUrl}-${index}`} className="aspect-video overflow-hidden rounded-2xl border border-[var(--foreground)]/20 bg-[var(--surface-soft)]">
                    <iframe
                      className="h-full w-full"
                      src={embedUrl}
                      title={`${project.title} extra video ${index + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {lightboxOpen ? (
          <ImageLightbox
            images={lightboxImages}
            open={lightboxOpen}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        ) : null}

        {/* Details and Code Sections */}
        {(project.showDetails || project.showCode) && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 sm:mb-20"
          >
            <div className="paper-card">
              {/* Tabs */}
              <div className="flex flex-col border-b border-[var(--foreground)]/10 bg-[var(--surface-soft)] sm:flex-row">
                {project.showDetails && (
                  <motion.button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 px-4 py-4 text-sm font-semibold transition relative sm:px-6 ${
                      activeTab === "details"
                        ? "text-[var(--accent)]"
                        : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                    }`}
                  >
                    Details
                    {activeTab === "details" && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]"
                      />
                    )}
                  </motion.button>
                )}
                {project.showCode && (
                  <motion.button
                    onClick={() => setActiveTab("code")}
                    className={`flex-1 px-4 py-4 text-sm font-semibold transition relative sm:px-6 ${
                      activeTab === "code"
                        ? "text-[var(--accent)]"
                        : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                    }`}
                  >
                    Code
                    {activeTab === "code" && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]"
                      />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Tab Content */}
              <div className="p-5 sm:p-8">
                <AnimatePresence mode="wait">
                  {activeTab === "details" && project.longDescription && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="prose max-w-none text-[var(--foreground)]"
                    >
                      <p className="whitespace-pre-line text-base font-light leading-relaxed text-[var(--foreground)]/80 md:text-lg">
                        {project.longDescription}
                      </p>
                    </motion.div>
                  )}

                  {activeTab === "code" && project.codeUrl && (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <p className="text-lg text-[var(--foreground)]/80">
                        Access the source code repository for complete project details:
                      </p>
                      <motion.a
                        href={project.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="paper-button-primary inline-flex items-center gap-3 px-8 py-4 font-semibold"
                      >
                        <Code className="w-5 h-5" />
                        {project.codeName || "View Code"}
                      </motion.a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
