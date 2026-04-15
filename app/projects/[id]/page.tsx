"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Code, GitBranch, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { Project } from "@/app/lib/types";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "code">("details");

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

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-4 md:px-8 mb-20"
      >
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Image */}
          <div className="relative">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.title}
                width={600}
                height={400}
                className="rounded-3xl w-full h-auto object-cover shadow-lg"
              />
            ) : (
              <div className="bg-gradient-to-br from-violet-200 to-pink-200 rounded-3xl overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-2xl md:text-6xl font-bold text-white opacity-20">
                  {project.category}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold inline-block mb-4">
                {project.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
            </div>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              {project.description}
            </p>

            {/* Tech Stack */}
            {project.tech && project.tech.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-3 font-semibold">Technologies</div>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                >
                  <ExternalLink className="w-5 h-5" />
                  Live Demo
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                >
                  <GitBranch className="w-5 h-5" />
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* YouTube Video Section */}
      {youtubeId && (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto px-4 md:px-8 mb-20"
        >
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-violet-600 to-pink-600 px-6 md:px-8 py-4">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Play className="w-6 h-6" />
                {project.youtubeTitle || "Video"}
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

      {/* Details and Code Sections */}
      {(project.showDetails || project.showCode) && (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-6xl mx-auto px-4 md:px-8"
        >
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {project.showDetails && (
                <button
                  onClick={() => setActiveTab("details")}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === "details"
                      ? "text-violet-600 border-b-2 border-violet-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Details
                </button>
              )}
              {project.showCode && (
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === "code"
                      ? "text-violet-600 border-b-2 border-violet-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Code
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {activeTab === "details" && project.longDescription && (
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="whitespace-pre-line leading-relaxed">
                    {project.longDescription}
                  </p>
                </div>
              )}

              {activeTab === "code" && project.codeUrl && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Access the source code for this project:
                  </p>
                  <a
                    href={project.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-semibold"
                  >
                    <Code className="w-5 h-5" />
                    {project.codeName || "View Code"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
