"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Code, GitBranch, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/app/lib/types";
import ImageLightbox from "@/app/components/ImageLightbox";
import { getYouTubeEmbedUrl, getYouTubeId } from "@/app/lib/youtube";

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
    <div className="min-h-screen bg-gradient-to-br from-[#fbf7f0] to-[#f4eadb] pb-20 pt-20 md:pt-28">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#c4a884]/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#eadbbf]/45 blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 md:px-8 lg:px-10 2xl:px-16">
        {/* Header */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/12 bg-white px-3 py-2 text-sm font-semibold text-[#5f4a38] transition group hover:text-[#8d6b4e] sm:mb-8"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          Back to Home
        </Link>

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
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#c4a884] to-[#eadbbf] blur-2xl opacity-50 transition duration-300 group-hover:opacity-75"></div>
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
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#c4a884] to-[#eadbbf] shadow-2xl sm:rounded-3xl">
                  <div className="text-2xl font-bold text-[#5f4a38] opacity-30 md:text-6xl">
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
                  className="mb-4 inline-block rounded-full border border-[#7a5f47]/15 bg-[#fbf7f0] px-4 py-2 text-sm font-semibold text-[#7a5f47]"
                >
                  {project.category}
                </motion.span>
                <h1 className="mb-4 text-3xl font-bold leading-tight text-[#2f241b] sm:text-4xl md:mb-6 md:text-6xl">
                  {project.title}
                </h1>
              </div>

              <p className="text-base leading-relaxed text-[#6a5846] sm:text-lg md:text-xl">
                {project.description}
              </p>

              {/* Tech Stack */}
              {project.tech && project.tech.length > 0 && (
                <div>
                  <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#8d6b4e]">Technologies</div>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech: string) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-full border border-[#7a5f47]/12 bg-white px-3 py-2 text-sm font-medium text-[#6a5846] transition hover:bg-[#f7efe4]"
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
                    className="inline-flex items-center gap-2 rounded-lg bg-[#8d6b4e] px-5 py-3 font-semibold text-[#fffaf3] transition-all hover:shadow-lg sm:px-6"
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
                    className="inline-flex items-center gap-2 rounded-lg border border-[#7a5f47]/12 bg-white px-5 py-3 font-semibold text-[#5f4a38] transition-all hover:bg-[#f7efe4] sm:px-6"
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
            <div className="overflow-hidden rounded-3xl border border-[#7a5f47]/12 bg-white shadow-2xl backdrop-blur">
              <div className="bg-gradient-to-r from-[#c4a884] to-[#eadbbf] px-5 py-5 sm:px-6 md:px-8 md:py-6">
                <h2 className="flex items-center gap-3 text-xl font-bold text-[#2f241b] sm:text-2xl md:text-3xl">
                  <Play className="h-6 w-6 rounded-full bg-white/60 p-1 sm:h-7 sm:w-7 sm:p-1.5" />
                  {project.youtubeTitle || "Project Video"}
                </h2>
              </div>

              {youtubeEmbedUrl ? (
                <div className="aspect-video w-full bg-[#f7efe4]">
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
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#5f4a38]">
                      <Play className="h-7 w-7" />
                    </div>
                    <p className="text-base text-[#6a5846] sm:text-lg">
                      The YouTube link is present, but the video preview could not be embedded from this URL format.
                    </p>
                    <a
                      href={project.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#8d6b4e] px-5 py-3 text-sm font-semibold text-[#fffaf3] transition hover:opacity-95"
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
            <div className="overflow-hidden rounded-3xl border border-[#7a5f47]/12 bg-white p-5 shadow-2xl backdrop-blur sm:p-6 md:p-8">
              <h2 className="mb-5 text-xl font-bold text-[#2f241b] sm:mb-6 sm:text-2xl md:text-3xl">Project Gallery</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                {project.galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => openLightbox(project.galleryImages || [], index)}
                    className="relative h-40 overflow-hidden rounded-2xl border border-[#7a5f47]/12 bg-[#f7efe4] sm:h-48"
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
            <div className="overflow-hidden rounded-3xl border border-[#7a5f47]/12 bg-white p-5 shadow-2xl backdrop-blur sm:p-6 md:p-8">
              <h2 className="mb-5 text-xl font-bold text-[#2f241b] sm:mb-6 sm:text-2xl md:text-3xl">More Videos</h2>
              <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
                {extraYouTubeEmbedUrls.map((embedUrl, index) => (
                  <div key={`${embedUrl}-${index}`} className="aspect-video overflow-hidden rounded-2xl border border-[#7a5f47]/12 bg-[#f7efe4]">
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
            <div className="overflow-hidden rounded-3xl border border-[#7a5f47]/12 bg-white shadow-2xl backdrop-blur">
              {/* Tabs */}
              <div className="flex flex-col border-b border-[#7a5f47]/10 bg-[#fbf7f0] backdrop-blur sm:flex-row">
                {project.showDetails && (
                  <motion.button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 px-4 py-4 text-sm font-semibold transition relative sm:px-6 ${
                      activeTab === "details"
                        ? "text-[#8d6b4e]"
                        : "text-[#8c7763] hover:text-[#5f4a38]"
                    }`}
                    whileHover={{ backgroundColor: "rgba(235, 216, 188, 0.45)" }}
                  >
                    Details
                    {activeTab === "details" && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8d6b4e] to-[#c4a884]"
                      />
                    )}
                  </motion.button>
                )}
                {project.showCode && (
                  <motion.button
                    onClick={() => setActiveTab("code")}
                    className={`flex-1 px-4 py-4 text-sm font-semibold transition relative sm:px-6 ${
                      activeTab === "code"
                        ? "text-[#8d6b4e]"
                        : "text-[#8c7763] hover:text-[#5f4a38]"
                    }`}
                    whileHover={{ backgroundColor: "rgba(235, 216, 188, 0.45)" }}
                  >
                    Code
                    {activeTab === "code" && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8d6b4e] to-[#c4a884]"
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
                      className="prose max-w-none text-[#2f241b]"
                    >
                      <p className="whitespace-pre-line text-base font-light leading-relaxed text-[#6a5846] md:text-lg">
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
                      <p className="text-lg text-[#6a5846]">
                        Access the source code repository for complete project details:
                      </p>
                      <motion.a
                        href={project.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
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
