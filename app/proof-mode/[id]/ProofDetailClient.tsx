"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Code2,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  FileCode,
} from "lucide-react";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PaperBackground from "@/app/components/PaperBackground";
import { BackButton } from "@/app/components/NavigationContext";
import InteractiveProofVisualizer from "@/app/components/InteractiveProofVisualizer";
import ImageLightbox from "@/app/components/ImageLightbox";
import { useMotionPreferences } from "@/app/components/MotionProvider";
import type { ProofExperience, Project } from "@/app/lib/types";

interface ProofDetailClientProps {
  proofExperience: ProofExperience;
  associatedProject: Project | null;
}

export default function ProofDetailClient({
  proofExperience,
  associatedProject,
}: ProofDetailClientProps) {
  const { reducedMotion } = useMotionPreferences();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Accordion state
  const isDefaultExpanded = proofExperience.defaultSectionState !== "collapsed";
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(isDefaultExpanded);

  const images = proofExperience.images || associatedProject?.galleryImages || [];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] relative">
      <PaperBackground />
      <Header />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto w-full z-10">
        {/* Top Back Navigation */}
        <div className="mb-8">
          <BackButton
            fallback="/proof-mode"
            className="paper-button inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider mb-6 font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Proof Mode
          </BackButton>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="paper-chip uppercase tracking-[0.2em] font-mono text-xs bg-[var(--surface-strong)] text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5 inline mr-1.5" />
              {proofExperience.category}
            </span>
            <span className="paper-chip uppercase font-mono text-[10px] bg-[var(--surface-soft)]">
              Demo: {proofExperience.demonstrationType.replace("_", " ")}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--foreground)] tracking-tighter leading-tight">
            {proofExperience.title}
          </h1>

          <p className="mt-4 text-base sm:text-xl font-medium text-[var(--foreground)]/85 max-w-3xl leading-relaxed">
            {proofExperience.shortDescription}
          </p>
        </div>

        {/* PROJECT SNAPSHOT METADATA BLOCK */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="paper-card p-6 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[6px_6px_0_0_rgba(42,36,31,0.15)] mb-10"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--foreground)]/15">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 block">
                Category
              </span>
              <span className="text-sm font-black text-[var(--foreground)]">
                {proofExperience.category}
              </span>
            </div>

            <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 block">
                Demonstration Engine
              </span>
              <span className="text-sm font-black text-[var(--foreground)] capitalize">
                {proofExperience.demonstrationType.replace(/_/g, " ")}
              </span>
            </div>

            <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 block">
                Linked Project
              </span>
              <span className="text-sm font-black text-[var(--accent)] truncate block">
                {associatedProject ? associatedProject.title : "Standalone Proof"}
              </span>
            </div>

            <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/60 block">
                Verification Status
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
          </div>

          {/* Action Links */}
          {(associatedProject?.demo || associatedProject?.github || (proofExperience.evidenceLinks && proofExperience.evidenceLinks.length > 0)) && (
            <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-[var(--foreground)]/15">
              {associatedProject?.demo && (
                <a
                  href={associatedProject.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-button-primary px-4 py-2 text-xs font-extrabold inline-flex items-center gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live Project
                </a>
              )}
              {associatedProject?.github && (
                <a
                  href={associatedProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-button px-4 py-2 text-xs font-extrabold inline-flex items-center gap-2"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Source Repository
                </a>
              )}
              {proofExperience.evidenceLinks?.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-button px-4 py-2 text-xs font-bold inline-flex items-center gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[var(--accent)]" />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </motion.div>

        {/* MAIN PROOF CONTENT GRID */}
        <div className="space-y-10">
          {/* PROBLEM & STRATEGY (HOW I THINK) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="paper-card p-6 sm:p-8 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[6px_6px_0_0_rgba(42,36,31,0.12)] space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
                <Cpu className="h-4 w-4" />
                HOW I THINK · Problem Statement
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                The Engineering Challenge
              </h3>
              <p className="text-sm sm:text-base text-[var(--foreground)]/85 leading-relaxed">
                {proofExperience.problem}
              </p>
            </div>

            <div className="paper-card p-6 sm:p-8 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[6px_6px_0_0_rgba(42,36,31,0.12)] space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
                <Layers className="h-4 w-4" />
                HOW I THINK · Strategic Approach
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                Architectural Strategy
              </h3>
              <p className="text-sm sm:text-base text-[var(--foreground)]/85 leading-relaxed">
                {proofExperience.approach}
              </p>
            </div>
          </section>

          {/* TECHNICAL DETAILS (HOW IT WORKS) */}
          <section className="paper-card p-6 sm:p-8 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[6px_6px_0_0_rgba(42,36,31,0.15)] space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
              <FileCode className="h-4 w-4" />
              HOW IT WORKS · Engineering Breakdown
            </div>
            <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
              Technical Implementation
            </h3>
            <p className="text-sm sm:text-base text-[var(--foreground)]/85 leading-relaxed whitespace-pre-line">
              {proofExperience.technicalDetails}
            </p>

            {/* Tech Badges if associated project exists */}
            {associatedProject?.tech && associatedProject.tech.length > 0 && (
              <div className="pt-4 border-t border-[var(--foreground)]/15">
                <span className="text-xs font-bold uppercase text-[var(--foreground)]/60 block mb-2">
                  Technology Stack:
                </span>
                <div className="flex flex-wrap gap-2">
                  {associatedProject.tech.map((t) => (
                    <span key={t} className="paper-chip px-3 py-1 text-xs font-bold bg-[var(--surface-soft)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* INTERACTIVE EVIDENCE VISUALIZER */}
          <section className="space-y-4">
            <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--foreground)]/60 px-1">
              EVIDENCE DEMONSTRATION ENGINE
            </div>
            <InteractiveProofVisualizer
              type={proofExperience.demonstrationType}
              config={proofExperience.demonstrationConfig}
              title={proofExperience.title}
            />
          </section>

          {/* SEE THE RESULT (QUANTIFIED IMPACT) */}
          <section className="paper-card p-6 sm:p-8 bg-[var(--surface-strong)] border-2 border-[var(--foreground)] shadow-[8px_8px_0_0_rgba(42,36,31,0.15)] space-y-4">
            <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
              SEE THE RESULT · Quantified Impact
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-[var(--foreground)] leading-snug">
              {proofExperience.result}
            </h3>

            {proofExperience.evidenceLinks && proofExperience.evidenceLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--foreground)]/15">
                <span className="text-xs font-bold text-[var(--foreground)]/70">
                  Verified Evidence Links:
                </span>
                {proofExperience.evidenceLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-button px-4 py-2 text-xs font-bold inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--accent)]" />
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* ADDITIONAL DETAILS & MEDIA ACCORDION */}
          {(images.length > 0 || associatedProject?.longDescription) && (
            <section className="paper-card p-6 bg-[var(--surface)] border-2 border-[var(--foreground)] shadow-[4px_4px_0_0_rgba(42,36,31,0.12)]">
              <button
                onClick={() => setAdditionalDetailsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-left font-black text-lg text-[var(--foreground)]"
              >
                <span>Additional Evidence & Deep-Dive Notes</span>
                {additionalDetailsOpen ? (
                  <ChevronUp className="h-5 w-5 text-[var(--accent)]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[var(--foreground)]/60" />
                )}
              </button>

              <AnimatePresence>
                {additionalDetailsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 pt-4 border-t border-[var(--foreground)]/15 mt-4"
                  >
                    {associatedProject?.longDescription && (
                      <div>
                        <h4 className="text-xs font-bold uppercase text-[var(--foreground)]/60 mb-2">
                          Project Background Notes
                        </h4>
                        <p className="text-sm text-[var(--foreground)]/80 leading-relaxed whitespace-pre-line">
                          {associatedProject.longDescription}
                        </p>
                      </div>
                    )}

                    {images.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase text-[var(--foreground)]/60 mb-3">
                          Evidence Screenshots & Artifacts
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setLightboxIndex(idx);
                                setLightboxOpen(true);
                              }}
                              className="relative aspect-video rounded-xl overflow-hidden border border-[var(--foreground)]/20 hover:border-[var(--accent)] transition-all group"
                            >
                              <Image
                                src={img}
                                alt={`Evidence artifact ${idx + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}

          {/* LIGHTBOX FOR MEDIA */}
          {lightboxOpen && (
            <ImageLightbox
              open={lightboxOpen}
              images={images}
              initialIndex={lightboxIndex}
              onClose={() => setLightboxOpen(false)}
            />
          )}

          {/* FOOTER BACK NAVIGATION */}
          <div className="pt-6 text-center">
            <BackButton
              fallback="/proof-mode"
              className="paper-button-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-extrabold"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Proof Mode Library
            </BackButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
