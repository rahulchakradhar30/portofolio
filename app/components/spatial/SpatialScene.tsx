"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HomepageSectionConfig } from "@/app/lib/types";
import SectionRegistry from "../SectionRegistry";

interface SpatialSceneProps {
  section: HomepageSectionConfig;
  index: number;
  activeIndex: number;
  totalScenes: number;
  motionBlurEnabled?: boolean;
  reducedMotion?: boolean;
}

export default function SpatialScene({
  section,
  index,
  activeIndex,
  totalScenes,
  motionBlurEnabled = false,
  reducedMotion = false,
}: SpatialSceneProps) {
  const isActive = index === activeIndex;
  const isNearby = Math.abs(index - activeIndex) <= 1;

  // Performance budget: if scene is distant, omit heavy inner rendering
  if (!isNearby && !isActive) {
    return (
      <div 
        id={section.id}
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none opacity-0 overflow-hidden" 
      />
    );
  }

  // Animation variants
  const getVariants = () => {
    if (reducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: isActive ? 1 : 0 },
        exit: { opacity: 0 },
      };
    }

    return {
      initial: (direction: number) => ({
        opacity: 0,
        scale: direction > 0 ? 0.88 : 1.12,
        y: direction > 0 ? 60 : -60,
        rotateX: direction > 0 ? 12 : -12,
        filter: motionBlurEnabled ? "blur(8px)" : "blur(0px)",
      }),
      animate: {
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.94,
        y: isActive ? 0 : 0,
        rotateX: 0,
        filter: "blur(0px)",
      },
      exit: (direction: number) => ({
        opacity: 0,
        scale: direction < 0 ? 0.88 : 1.12,
        y: direction < 0 ? 60 : -60,
        rotateX: direction < 0 ? 12 : -12,
        filter: motionBlurEnabled ? "blur(8px)" : "blur(0px)",
      }),
    };
  };

  const direction = index - activeIndex;

  return (
    <AnimatePresence custom={direction} mode="wait">
      {isActive && (
        <motion.div
          key={section.id}
          custom={direction}
          variants={getVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: reducedMotion ? 0.25 : 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ willChange: "transform, opacity, filter" }}
          className="w-full min-h-full flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12 lg:py-20"
        >
          {/* Spatial Scene Card Outer Surface Container */}
          <div className="relative mx-auto w-full max-w-7xl">
            {/* Spatial Header Tag */}
            <div className="mb-4 sm:mb-6 flex items-center justify-between pointer-events-none select-none">
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono tracking-wider uppercase text-[var(--accent)] font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span>SCENE 0{index + 1} :: {section.publicDisplayTitle || section.id}</span>
              </div>
              <div className="text-[11px] font-mono text-[var(--foreground)] opacity-40">
                [{index + 1} / {totalScenes}]
              </div>
            </div>

            {/* Section Renderer */}
            <div className="relative rounded-2xl sm:rounded-3xl border border-[var(--border-thin,rgba(255,255,255,0.1))] bg-[var(--surface)]/90 backdrop-blur-xl shadow-2xl p-4 sm:p-8 lg:p-12 overflow-y-auto max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] custom-scrollbar">
              <SectionRegistry section={section} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
