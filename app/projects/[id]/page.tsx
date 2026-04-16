"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Code, GitBranch, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { Project } from "@/app/lib/types";
import ImageLightbox from "@/app/components/ImageLightbox";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "code">("details");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images.filter(Boolean));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/admin/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Project Not Found</h1>
          <Link
            href="/"
            className="text-violet-600 hover:text-violet-700 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeId = project.youtubeUrl ? getYouTubeId(project.youtubeUrl) : null;
  const extraYoutubeIds = (project.youtubeLinks || [])
    .map((link) => getYouTubeId(link))
    .filter((id): id is string => Boolean(id));

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-20 bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 md:px-8 lg:px-10 2xl:px-16">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 mb-8 font-semibold transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 2xl:gap-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative"
            >
              {project.image ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-300"></div>
                  <button
                    type="button"
                    onClick={() => openLightbox([project.image], 0)}
                    className="relative block w-full overflow-hidden rounded-3xl"
                    title="Click to view full image"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={600}
                      height={400}
                      className="relative rounded-3xl w-full h-auto object-cover shadow-2xl"
                    />
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-violet-600 to-pink-600 rounded-3xl overflow-hidden aspect-video flex items-center justify-center shadow-2xl">
                  <div className="text-2xl md:text-6xl font-bold text-white opacity-30">
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
              className="space-y-6"
            >
              <div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block px-4 py-2 bg-gradient-to-r from-violet-600/20 to-pink-600/20 border border-violet-500/50 text-violet-300 rounded-full text-sm font-semibold mb-4"
                >
                  {project.category}
                </motion.span>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {project.title}
                </h1>
              </div>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                {project.description}
              </p>

              {/* Tech Stack */}
              {project.tech && project.tech.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-3 font-semibold uppercase tracking-wider">Technologies</div>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech: string) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-2 bg-violet-600/20 border border-violet-500/50 text-violet-300 rounded-full text-sm font-medium hover:bg-violet-600/30 transition"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6">
                {project.demo && (
                  <motion.a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700/50 border border-slate-600 text-gray-200 rounded-lg hover:bg-slate-700 transition-all font-semibold"
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
        {youtubeId && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-violet-600 to-pink-600 px-6 md:px-8 py-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  <Play className="w-7 h-7 bg-white/20 p-1.5 rounded-full" />
                  {project.youtubeTitle || "Project Video"}
                </h2>
              </div>
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={project.youtubeTitle || "Project Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.section>
        )}

        {project.galleryImages && project.galleryImages.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Project Gallery</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => openLightbox(project.galleryImages || [], index)}
                    className="relative h-48 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900"
                    title="Click to open and zoom"
                  >
                    <Image src={image} alt={`${project.title} gallery ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {extraYoutubeIds.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">More Videos</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {extraYoutubeIds.map((id, index) => (
                  <div key={`${id}-${index}`} className="aspect-video overflow-hidden rounded-2xl border border-slate-700/60">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${id}`}
                      title={`${project.title} extra video ${index + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
            className="mb-20"
          >
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
              {/* Tabs */}
              <div className="flex border-b border-slate-700/50 bg-slate-800/70 backdrop-blur">
                {project.showDetails && (
                  <motion.button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 px-6 py-4 font-semibold transition relative ${
                      activeTab === "details"
                        ? "text-violet-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                  >
                    Details
                    {activeTab === "details" && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-pink-600"
                      />
                    )}
                  </motion.button>
                )}
                {project.showCode && (
                  <motion.button
                    onClick={() => setActiveTab("code")}
                    className={`flex-1 px-6 py-4 font-semibold transition relative ${
                      activeTab === "code"
                        ? "text-violet-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                  >
                    Code
                    {activeTab === "code" && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-pink-600"
                      />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === "details" && project.longDescription && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="prose prose-invert max-w-none text-gray-200"
                    >
                      <p className="whitespace-pre-line leading-relaxed text-base md:text-lg text-gray-300 font-light">
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
                      <p className="text-gray-300 text-lg">
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
