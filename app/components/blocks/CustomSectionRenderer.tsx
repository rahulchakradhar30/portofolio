"use client";

import React from "react";
import { motion } from "framer-motion";
import type { HomepageSectionConfig } from "@/app/lib/types";
import BlockRegistry from "./BlockRegistry";
import { useMotionPreferences } from "../MotionProvider";

export default function CustomSectionRenderer({ section }: { section: HomepageSectionConfig }) {
  const { reducedMotion } = useMotionPreferences();

  if (section.visible === false) return null;

  const sectionId = section.id || "custom-section";
  const bgClass =
    section.bgTreatment === "soft"
      ? "bg-[var(--surface-soft)]"
      : section.bgTreatment === "strong"
      ? "bg-[var(--surface-strong)]"
      : section.bgTreatment === "glass"
      ? "glass-surface bg-[var(--surface)]/90 backdrop-blur-md"
      : "bg-transparent";

  const blocks = section.blocks && section.blocks.length > 0 ? section.blocks : [];

  return (
    <section id={sectionId} className={`relative scroll-mt-28 px-4 py-20 sm:px-6 lg:px-10 lg:py-28 ${bgClass}`}>
      <div className="mx-auto max-w-[1600px]">
        {/* Section Header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 25 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12 text-center"
        >
          <div className="paper-chip mx-auto mb-4 inline-flex uppercase tracking-[0.2em] font-bold">
            {section.navLabel || "Section"}
          </div>
          <h2 className="text-3xl font-black md:text-5xl tracking-tighter text-[var(--foreground)]">
            {section.publicDisplayTitle}
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 bg-[var(--foreground)] editorial-border rounded-full" />
        </motion.div>

        {/* Render Blocks */}
        <div className="space-y-6">
          {blocks.map((block) => (
            <BlockRegistry key={block.id} block={block} />
          ))}
        </div>
      </div>
    </section>
  );
}
