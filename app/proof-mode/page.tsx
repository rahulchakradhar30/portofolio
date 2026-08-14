"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Layers,
  ArrowRight,
  Search,
  Cpu,
  Workflow,
  Sliders,
  HelpCircle,
  Zap,
} from "lucide-react";

import Footer from "@/app/components/Footer";
import { BackButton } from "@/app/components/NavigationContext";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import ScrollContainer from "@/app/components/ScrollContainer";
import { useMotionPreferences } from "@/app/components/MotionProvider";
import { usePortfolioContent } from "@/app/components/PortfolioContentProvider";
import type { ProofExperience, Project, DemonstrationType } from "@/app/lib/types";

const CAPABILITY_CATEGORIES = [
  "All",
  "Engineering",
  "AI / ML",
  "Problem Solving",
  "Creative Technology",
  "Product Thinking",
];

const DEMO_ICONS: Record<DemonstrationType, typeof Cpu> = {
  architecture_visualizer: Cpu,
  before_after: Sliders,
  decision_simulation: HelpCircle,
  system_flow: Workflow,
  interactive_demo: Zap,
};

export default function ProofModePage() {
  const { reducedMotion } = useMotionPreferences();
  const { content } = usePortfolioContent();
  const [proofExperiences, setProofExperiences] = useState<ProofExperience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const scrollConfig = content?.scrollConfigs?.proofModeCards || {
    desktop: "vertical",
    tablet: "vertical",
    mobile: "vertical",
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [proofRes, projectsRes] = await Promise.all([
          fetch("/api/admin/proof-mode", { cache: "no-store" }),
          fetch("/api/admin/projects", { cache: "no-store" }),
        ]);

        if (proofRes.ok) {
          const proofData = await proofRes.json();
          setProofExperiences(proofData.proofExperiences || []);
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
    return proofExperiences.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchesQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [proofExperiences, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] relative">
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto w-full z-10">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10">
          <BackButton
            fallback="/"
            className="paper-button inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider mb-6 font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </BackButton>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="paper-chip inline-flex items-center gap-2 uppercase tracking-[0.24em] font-mono text-xs bg-[var(--surface-strong)] text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Evidence Library
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[var(--foreground)] tracking-tighter">
            PROOF MODE
          </h1>

          <p className="mt-3 text-base sm:text-xl text-[var(--foreground)]/80 max-w-3xl font-medium leading-relaxed">
            Explore architectural breakdowns, system flows, decision trees, and verified engineering benchmarks backed by real project evidence.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton variant="hero" />
        ) : proofExperiences.length === 0 ? (
          /* Empty State */
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
          /* Main Proof Library Experience */
          <div className="space-y-8">
            {/* Search and Category Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[var(--foreground)]/15">
              {/* Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
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
                      onClick={() => setSelectedCategory(cat)}
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

              {/* Instant Search Bar */}
              <div className="relative min-w-[240px] md:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter evidence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-medium rounded-xl border-2 border-[var(--foreground)]/30 bg-[var(--surface)] focus:border-[var(--foreground)] focus:outline-none shadow-[2px_2px_0_0_rgba(42,36,31,0.08)]"
                />
              </div>
            </div>

            {/* Empty Search Filter Result */}
            {filteredExperiences.length === 0 ? (
              <div className="text-center py-16 paper-card bg-[var(--surface-soft)] p-8">
                <p className="text-base font-bold text-[var(--foreground)]">
                  No proof experiences match your criteria.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="paper-button mt-4 px-4 py-2 text-xs font-bold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Proof Cards Grid/Carousel Container */
              <ScrollContainer
                config={scrollConfig}
                verticalClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                horizontalItemClassName="shrink-0 w-[300px] sm:w-[380px] md:w-[420px] snap-start"
                ariaLabel="Proof experiences grid"
              >
                {filteredExperiences.map((exp) => {
                  const associatedProject = projects.find((p) => p.id === exp.projectId);
                  const IconComp = DEMO_ICONS[exp.demonstrationType] || Cpu;

                  return (
                    <motion.div
                      key={exp.id}
                      whileHover={reducedMotion ? undefined : { y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="paper-card h-full flex flex-col justify-between p-6 sm:p-7 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[6px_6px_0_0_rgba(42,36,31,0.15)] hover:shadow-[10px_10px_0_0_rgba(42,36,31,0.2)] transition-all"
                    >
                      <div className="space-y-4">
                        {/* Card Header Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="paper-chip text-[10px] uppercase font-mono px-2.5 py-1 bg-[var(--surface-strong)] text-[var(--foreground)]">
                            {exp.category}
                          </span>
                          <span className="paper-chip text-[10px] font-mono uppercase bg-[var(--surface-soft)] text-[var(--accent)] inline-flex items-center gap-1">
                            <IconComp className="h-3 w-3" />
                            {exp.demonstrationType.replace("_", " ")}
                          </span>
                        </div>

                        {/* Optional Thumbnail Visual */}
                        {associatedProject?.image ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--foreground)]/15">
                            <Image
                              src={associatedProject.image}
                              alt={exp.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                              <span className="text-[11px] font-bold text-white tracking-wide truncate">
                                Evidence Source: {associatedProject.title}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {/* Title & Short Description */}
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] leading-tight tracking-tight">
                            {exp.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[var(--foreground)]/80 font-medium line-clamp-2 mt-2 leading-relaxed">
                            {exp.shortDescription}
                          </p>
                        </div>

                        {/* Highlight Snapshot */}
                        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--foreground)]/15 text-xs space-y-1.5">
                          <div>
                            <span className="font-extrabold uppercase text-[var(--foreground)]/60 text-[10px] block">
                              Quantified Result:
                            </span>
                            <span className="font-bold text-[var(--foreground)] line-clamp-1">
                              {exp.result}
                            </span>
                          </div>
                        </div>

                        {/* Tech Badges if present */}
                        {associatedProject?.tech && associatedProject.tech.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {associatedProject.tech.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="paper-chip text-[10px] font-bold px-2 py-0.5 bg-[var(--surface-soft)]"
                              >
                                {tech}
                              </span>
                            ))}
                            {associatedProject.tech.length > 4 && (
                              <span className="text-[10px] font-bold text-[var(--foreground)]/60 py-0.5">
                                +{associatedProject.tech.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Action Link */}
                      <div className="pt-6 border-t border-[var(--foreground)]/15 mt-4">
                        <Link
                          href={`/proof-mode/${exp.id}`}
                          className="paper-button-primary w-full py-3 px-4 text-xs font-extrabold inline-flex items-center justify-center gap-2 group tracking-wide"
                        >
                          <span>Inspect Proof & Evidence</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </ScrollContainer>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
