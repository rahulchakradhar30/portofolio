"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Code2,
  Layers,
} from "lucide-react";


import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { BackButton } from "@/app/components/NavigationContext";
import PaperBackground from "@/app/components/PaperBackground";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import InteractiveProofVisualizer from "@/app/components/InteractiveProofVisualizer";
import { useMotionPreferences } from "@/app/components/MotionProvider";
import type { ProofExperience, Project } from "@/app/lib/types";

const CAPABILITY_CATEGORIES = [
  "All",
  "Engineering",
  "AI / ML",
  "Problem Solving",
  "Creative Technology",
  "Product Thinking",
];

export default function ProofModePage() {
  const { reducedMotion } = useMotionPreferences();
  const [proofExperiences, setProofExperiences] = useState<ProofExperience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [proofRes, projectsRes] = await Promise.all([
          fetch("/api/admin/proof-mode", { cache: "no-store" }),
          fetch("/api/admin/projects", { cache: "no-store" }),
        ]);

        if (proofRes.ok) {
          const proofData = await proofRes.json();
          const items: ProofExperience[] = proofData.proofExperiences || [];
          setProofExperiences(items);
          if (items.length > 0) {
            setSelectedExperienceId(items[0].id);
          }
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects || []);
        }
      } catch (err) {
        console.error("Error loading Proof Mode data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredExperiences = useMemo(() => {
    if (selectedCategory === "All") return proofExperiences;
    return proofExperiences.filter((item) => item.category === selectedCategory);
  }, [proofExperiences, selectedCategory]);

  const activeExperience = useMemo(() => {
    return (
      filteredExperiences.find((item) => item.id === selectedExperienceId) ||
      filteredExperiences[0] ||
      null
    );
  }, [filteredExperiences, selectedExperienceId]);

  const associatedProject = useMemo(() => {
    if (!activeExperience?.projectId) return null;
    return projects.find((p) => p.id === activeExperience.projectId) || null;
  }, [activeExperience, projects]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] relative">
      <PaperBackground />
      <Header />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto w-full z-10">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10">
          <BackButton
            fallback="/"
            className="paper-button inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider mb-6 font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </BackButton>

          <div className="paper-chip inline-flex items-center gap-2 uppercase tracking-[0.24em] font-mono text-xs bg-[var(--surface-strong)] text-[var(--accent)] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Evidence Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[var(--foreground)] tracking-tighter">
            PROOF MODE
          </h1>

          <p className="mt-3 text-lg sm:text-xl text-[var(--foreground)]/80 max-w-3xl font-medium leading-snug">
            Explore interactive architectural demonstrations, problem-solving workflows, and real engineering impact.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton variant="hero" />
        ) : proofExperiences.length === 0 ? (
          /* Empty State Rule */
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="paper-card p-8 sm:p-14 text-center max-w-2xl mx-auto my-12 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[8px_8px_0_0_rgba(42,36,31,0.15)] space-y-6"
          >
            <div className="p-4 rounded-full bg-[var(--surface-strong)] inline-block border border-[var(--foreground)]/20 shadow-[2px_2px_0_0_rgba(42,36,31,0.1)]">
              <Sparkles className="h-10 w-10 text-[var(--accent)]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Proof Mode is being prepared.
            </h2>

            <p className="text-sm sm:text-base text-[var(--foreground)]/75 leading-relaxed">
              The interactive evidence dashboard is currently being updated with real engineering demonstrations and architectural visualizers. Check back shortly.
            </p>

            <div className="pt-4">
              <Link href="/#projects" className="paper-button-primary px-6 py-3 text-sm font-bold inline-flex items-center gap-2">
                <span>View Portfolio Projects</span>
                <Layers className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Interactive Experience Layout */
          <div className="space-y-8">
            {/* Category Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[var(--foreground)]/15">
              {CAPABILITY_CATEGORIES.map((cat) => {
                const count =
                  cat === "All"
                    ? proofExperiences.length
                    : proofExperiences.filter((item) => item.category === cat).length;
                if (count === 0 && cat !== "All") return null;

                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      const firstCatItem =
                        cat === "All"
                          ? proofExperiences[0]
                          : proofExperiences.find((item) => item.category === cat);
                      if (firstCatItem) setSelectedExperienceId(firstCatItem.id);
                    }}
                    className={`paper-chip px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-[var(--foreground)] text-[var(--surface)] shadow-[3px_3px_0_0_rgba(42,36,31,0.2)]"
                        : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]"
                    }`}
                  >
                    {cat} <span className="opacity-60 ml-1">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
              {/* Evidence Sidebar Selection */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--foreground)]/60 px-1">
                  Evidence Experiences
                </h3>

                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {filteredExperiences.map((exp) => {
                    const isSelected = exp.id === activeExperience?.id;
                    return (
                      <motion.button
                        key={exp.id}
                        whileHover={reducedMotion ? undefined : { x: 4 }}
                        whileTap={reducedMotion ? undefined : { x: 0 }}
                        onClick={() => setSelectedExperienceId(exp.id)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? "border-[var(--foreground)] bg-[var(--surface)] shadow-[6px_6px_0_0_rgba(42,36,31,0.15)] ring-2 ring-[var(--accent)]"
                            : "border-[var(--foreground)]/20 bg-[var(--surface)]/70 hover:bg-[var(--surface)] hover:border-[var(--foreground)]/50"
                        }`}
                      >
                        <span className="paper-chip text-[9px] uppercase font-mono px-2 py-0.5 mb-2 inline-block bg-[var(--surface-strong)]">
                          {exp.category}
                        </span>
                        <h4 className="text-base font-black text-[var(--foreground)] leading-snug">
                          {exp.title}
                        </h4>
                        <p className="text-xs text-[var(--foreground)]/70 line-clamp-2 mt-1 font-medium">
                          {exp.shortDescription}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Active Experience Detail Inspection */}
              {activeExperience && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeExperience.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8"
                  >
                    {/* WHAT I BUILD */}
                    <div className="paper-card p-6 sm:p-8 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[6px_6px_0_0_rgba(42,36,31,0.15)] space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-[var(--foreground)]/15 pb-4">
                        <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
                          WHAT I BUILD
                        </div>
                        <span className="paper-chip text-[10px] uppercase font-mono">
                          {activeExperience.category}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                        {activeExperience.title}
                      </h2>

                      <p className="text-base font-medium text-[var(--foreground)]/85 leading-relaxed">
                        {activeExperience.shortDescription}
                      </p>

                      {associatedProject && (
                        <div className="p-4 rounded-xl border border-[var(--foreground)]/20 bg-[var(--surface-soft)] flex items-center justify-between gap-4 mt-4">
                          <div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--foreground)]/60">
                              Associated Project Evidence
                            </div>
                            <div className="text-sm font-bold text-[var(--foreground)]">
                              {associatedProject.title}
                            </div>
                          </div>
                          {associatedProject.demo ? (
                            <a
                              href={associatedProject.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="paper-button px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              Live Project <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : associatedProject.github ? (
                            <a
                              href={associatedProject.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="paper-button px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              Repository <Code2 className="h-3 w-3" />

                            </a>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* HOW I THINK & HOW IT WORKS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* HOW I THINK */}
                      <div className="paper-card p-6 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[4px_4px_0_0_rgba(42,36,31,0.12)] space-y-3">
                        <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
                          HOW I THINK · Problem & Strategy
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold uppercase text-[var(--foreground)]/60 mb-1">
                            Challenge Statement
                          </h5>
                          <p className="text-sm text-[var(--foreground)]/85 leading-relaxed">
                            {activeExperience.problem}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[var(--foreground)]/10">
                          <h5 className="text-xs font-extrabold uppercase text-[var(--foreground)]/60 mb-1">
                            Architectural Strategy
                          </h5>
                          <p className="text-sm text-[var(--foreground)]/85 leading-relaxed">
                            {activeExperience.approach}
                          </p>
                        </div>
                      </div>

                      {/* HOW IT WORKS */}
                      <div className="paper-card p-6 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[4px_4px_0_0_rgba(42,36,31,0.12)] space-y-3">
                        <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
                          HOW IT WORKS · Engineering Breakdown
                        </div>
                        <p className="text-sm text-[var(--foreground)]/85 leading-relaxed whitespace-pre-line">
                          {activeExperience.technicalDetails}
                        </p>
                      </div>
                    </div>

                    {/* INTERACT WITH IT */}
                    <div>
                      <InteractiveProofVisualizer
                        type={activeExperience.demonstrationType}
                        config={activeExperience.demonstrationConfig}
                        title={activeExperience.title}
                      />
                    </div>

                    {/* SEE THE RESULT */}
                    <div className="paper-card p-6 sm:p-8 bg-[var(--surface-strong)] border-2 border-[var(--foreground)] shadow-[6px_6px_0_0_rgba(42,36,31,0.15)] space-y-4">
                      <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
                        SEE THE RESULT · Quantified Impact
                      </div>

                      <p className="text-lg font-black text-[var(--foreground)] leading-snug">
                        {activeExperience.result}
                      </p>

                      {activeExperience.evidenceLinks && activeExperience.evidenceLinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--foreground)]/15">
                          <span className="text-xs font-bold text-[var(--foreground)]/60">
                            Verified Evidence Links:
                          </span>
                          {activeExperience.evidenceLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="paper-button px-4 py-1.5 text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
