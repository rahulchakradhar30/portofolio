"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import { normalizeYouTubeUrl, normalizeYouTubeUrlList } from "@/app/lib/youtube";
import type { Project } from "@/app/lib/types";

const parseUrlList = (input: string) => {
  const values = input
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return Array.from(new Set(values));
};

const removeAtIndex = (values: string[], indexToRemove: number) => values.filter((_, index) => index !== indexToRemove);

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    tech: "",
    github: "",
    demo: "",
    featured: false,
    category: "",
    imageUrl: "",
    youtubeUrl: "",
    youtubeTitle: "",
    codeUrl: "",
    codeName: "",
    showCode: false,
    showDetails: false,
    galleryImagesText: "",
    youtubeLinksText: "",
  });
  const [uploading, setUploading] = useState(false);

  const resetProjectForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      longDescription: "",
      tech: "",
      github: "",
      demo: "",
      featured: false,
      category: "",
      imageUrl: "",
      youtubeUrl: "",
      youtubeTitle: "",
      codeUrl: "",
      codeName: "",
      showCode: false,
      showDetails: false,
      galleryImagesText: "",
      youtubeLinksText: "",
    });
    setEditingProjectId(null);
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await adminAPI.getProjects();
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and description are required");
      return;
    }
    if (!formData.imageUrl) {
      alert("Please upload an image first");
      return;
    }

    const galleryImages = parseUrlList(formData.galleryImagesText);
    const youtubeLinks = normalizeYouTubeUrlList(parseUrlList(formData.youtubeLinksText));
    const youtubeUrl = normalizeYouTubeUrl(formData.youtubeUrl);

    const newProject = {
      title: formData.title,
      description: formData.description,
      longDescription: formData.longDescription,
      tech: formData.tech.split(",").map((t) => t.trim()).filter((t) => t),
      github: formData.github,
      demo: formData.demo,
      featured: formData.featured,
      category: formData.category,
      image: formData.imageUrl,
      youtubeUrl,
      youtubeTitle: formData.youtubeTitle,
      codeUrl: formData.codeUrl,
      codeName: formData.codeName,
      showCode: formData.showCode,
      showDetails: formData.showDetails,
      galleryImages,
      youtubeLinks,
    };

    try {
      const res = editingProjectId
        ? await adminAPI.updateProject(editingProjectId, {
            title: formData.title,
            description: formData.description,
            longDescription: formData.longDescription,
            imageUrl: formData.imageUrl,
            techStack: formData.tech.split(",").map((t) => t.trim()).filter((t) => t),
            githubUrl: formData.github,
            demoUrl: formData.demo,
            category: formData.category,
            featured: formData.featured,
            youtubeUrl,
            youtubeTitle: formData.youtubeTitle,
            codeUrl: formData.codeUrl,
            codeName: formData.codeName,
            showCode: formData.showCode,
            showDetails: formData.showDetails,
            galleryImages,
            youtubeLinks,
          })
        : await adminAPI.createProject(newProject);
      if (res.success) {
        alert(editingProjectId ? "Project updated successfully!" : "Project added successfully!");
        resetProjectForm();
        setShowForm(false);
        loadProjects();
      } else {
        const error = res.error ? ` ${res.error}` : '';
        alert(`Failed to ${editingProjectId ? 'update' : 'add'} project.${error}`);
        console.error('Project creation failed:', res);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add project'}`);
      console.error('Project creation error:', error);
    }
  };

  const handleEditProject = (project: Project) => {
    setFormData({
      title: project.title || "",
      description: project.description || "",
      longDescription: project.longDescription || "",
      tech: Array.isArray(project.tech) ? project.tech.join(", ") : "",
      github: project.github || "",
      demo: project.demo || "",
      featured: Boolean(project.featured),
      category: project.category || "",
      imageUrl: project.image || "",
      youtubeUrl: project.youtubeUrl || "",
      youtubeTitle: project.youtubeTitle || "",
      codeUrl: project.codeUrl || "",
      codeName: project.codeName || "",
      showCode: Boolean(project.showCode),
      showDetails: Boolean(project.showDetails),
      galleryImagesText: (project.galleryImages || []).join("\n"),
      youtubeLinksText: (project.youtubeLinks || []).join("\n"),
    });
    setEditingProjectId(project.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await adminAPI.uploadToCloudinary(file);
      if (res.success) {
        const uploadedUrl = res.fileUrl || res.imageUrl;
        setFormData({ ...formData, imageUrl: uploadedUrl });
        alert('Image uploaded to Cloudinary successfully!');
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploads = await Promise.all(files.map((file) => adminAPI.uploadToCloudinary(file)));
      const uploadedUrls = uploads
        .filter((res) => res.success)
        .map((res) => res.fileUrl || res.imageUrl)
        .filter((url): url is string => Boolean(url));

      if (uploadedUrls.length > 0) {
        const currentGallery = parseUrlList(formData.galleryImagesText);
        const nextGallery = Array.from(new Set([...currentGallery, ...uploadedUrls]));
        setFormData({ ...formData, galleryImagesText: nextGallery.join('\n') });
        alert(`Uploaded ${uploadedUrls.length} gallery image(s) successfully!`);
      } else {
        alert('Failed to upload gallery image(s)');
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      alert('Error uploading gallery image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const nextGallery = removeAtIndex(parseUrlList(formData.galleryImagesText), indexToRemove);
    setFormData({ ...formData, galleryImagesText: nextGallery.join('\n') });
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const res = await adminAPI.deleteProject(projectId);
      if (res.success) {
        alert("Project deleted!");
        loadProjects();
      } else {
        alert("Failed to delete project");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Projects</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (showForm) {
              resetProjectForm();
              setShowForm(false);
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 rounded-lg bg-[#8d6b4e] px-4 py-2 text-white"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Close Form" : "Add Project"}
        </motion.button>
      </div>

      {showForm && (
        <div className="space-y-4 rounded-lg border border-[#eadbbf] bg-white p-6">
          <input
            type="text"
            placeholder="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-3 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20"
          />
          <textarea
            placeholder="Project Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-3 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20"
          />
          <input
            type="text"
            placeholder="Tech Stack (comma-separated)"
            value={formData.tech}
            onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
            className="w-full rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-3 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20"
          />
          <input
            type="text"
            placeholder="GitHub URL"
            value={formData.github}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            className="w-full rounded-lg border-2 border-[#7a5f47]/15 bg-white px-4 py-3 text-[#2f241b] placeholder-[#b29579] transition focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20"
          />
          <input
            type="text"
            placeholder="Demo URL"
            value={formData.demo}
            onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition"
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black file:bg-[#8d6b4e] file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md file:cursor-pointer hover:border-[#8d6b4e]/50 transition"
              />
              {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            {formData.imageUrl && (
              <div className="mt-2">
                <Image 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  width={128}
                  height={96}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Image uploaded</p>
              </div>
            )}
          </div>
          <textarea
            placeholder="Long Description (full details)"
            value={formData.longDescription}
            onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition resize-none"
          />
          <input
            type="text"
            placeholder="YouTube URL (optional)"
            value={formData.youtubeUrl}
            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition"
          />
          <input
            type="text"
            placeholder="YouTube Title"
            value={formData.youtubeTitle}
            onChange={(e) => setFormData({ ...formData, youtubeTitle: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition"
          />
          <div className="space-y-2 rounded-lg border border-[#eadbbf] bg-gray-50/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">Gallery Images (optional)</label>
              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#8d6b4e]">
                {parseUrlList(formData.galleryImagesText).length} selected
              </span>
            </div>
            <p className="text-xs text-gray-500">Paste one URL per line or upload multiple images and they will be appended.</p>
            <textarea
              placeholder="https://...\nhttps://..."
              value={formData.galleryImagesText}
              onChange={(e) => setFormData({ ...formData, galleryImagesText: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition resize-none"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImageUpload}
              disabled={uploading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {parseUrlList(formData.galleryImagesText).map((imageUrl, index) => (
                <span key={`${imageUrl}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
                  <span className="max-w-32 truncate">Image {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="rounded-full bg-[#fbf7f0] px-2 py-0.5 text-[10px] font-semibold hover:bg-gray-100"
                    title="Remove image"
                  >
                    Remove
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-[#eadbbf] bg-gray-50/50 p-3">
            <label className="block text-sm font-medium text-gray-700">More YouTube Links (optional)</label>
            <textarea
              placeholder="Paste any YouTube link: watch, youtu.be, embed, or shorts"
              value={formData.youtubeLinksText}
              onChange={(e) => setFormData({ ...formData, youtubeLinksText: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition resize-none"
            />
            <p className="text-xs text-gray-600">{normalizeYouTubeUrlList(parseUrlList(formData.youtubeLinksText)).length} extra video link(s) ready</p>
          </div>
          <input
            type="text"
            placeholder="Code URL (optional)"
            value={formData.codeUrl}
            onChange={(e) => setFormData({ ...formData, codeUrl: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition"
          />
          <input
            type="text"
            placeholder="Code Label (e.g., 'View Code', 'GitHub Repo')"
            value={formData.codeName}
            onChange={(e) => setFormData({ ...formData, codeName: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:border-[#8d6b4e] focus:outline-none focus:ring-2 focus:ring-[#c4a884]/20 transition"
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showCode}
                onChange={(e) => setFormData({ ...formData, showCode: e.target.checked })}
                className="w-4 h-4 accent-[#8d6b4e]"
              />
              <span className="text-sm text-gray-700 font-medium">Show Code Section</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showDetails}
                onChange={(e) => setFormData({ ...formData, showDetails: e.target.checked })}
                className="w-4 h-4 accent-[#8d6b4e]"
              />
              <span className="text-sm text-gray-700 font-medium">Show Details Section</span>
            </label>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 accent-[#8d6b4e]"
            />
            <span className="text-sm text-gray-700 font-medium">Featured</span>
          </label>
          <button
            onClick={handleAddProject}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {editingProjectId ? "Update Project" : "Add Project"}
          </button>
          {editingProjectId && (
            <button
              type="button"
              onClick={() => {
                resetProjectForm();
                setShowForm(false);
              }}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel Editing
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          projects.map((project: Project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hover:border-[#8d6b4e]/30"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.category}</p>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{project.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-violet-50 px-2 py-1 text-[#8d6b4e]">{project.featured ? 'Featured' : 'Regular'}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">Details: {project.showDetails ? 'On' : 'Off'}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">Code: {project.showCode ? 'On' : 'Off'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditProject(project)} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit Project">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                </button>
                <button onClick={() => handleDeleteProject(project.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
