"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { HomepageSectionConfig } from "@/app/lib/types";
import HeroWall from "./walls/HeroWall";
import AboutWall from "./walls/AboutWall";
import AcademicWall from "./walls/AcademicWall";
import RadarWall from "./walls/RadarWall";
import SkillsWall from "./walls/SkillsWall";
import ExperienceWall from "./walls/ExperienceWall";
import ProjectsWall from "./walls/ProjectsWall";
import CertificationsWall from "./walls/CertificationsWall";
import ProofWall from "./walls/ProofWall";
import ContactWall from "./walls/ContactWall";
import CustomWall from "./walls/CustomWall";
import { Sparkles, Layers, Box, Briefcase, Award, Code, Mail, ShieldCheck, Compass } from "lucide-react";

interface ImmersiveWallProps {
  section: HomepageSectionConfig;
  wallIndex: number;
  totalWalls: number;
  isActive: boolean;
  isAdjacent: boolean;
  isDistant: boolean;
  transform3D: string;
  spotlightIntensity: number;
  onSelect: () => void;
  reducedMotion?: boolean;
}

export default function ImmersiveWall({
  section,
  wallIndex,
  totalWalls,
  isActive,
  isAdjacent,
  isDistant,
  transform3D,
  spotlightIntensity,
  onSelect,
  reducedMotion = false,
}: ImmersiveWallProps) {
  // Section Wall Component Dispatcher
  const renderWallContent = () => {
    const secId = (section.id || "").toLowerCase();
    const secType = (section.type || "").toLowerCase();

    if (secId === "hero" || secType === "hero") return <HeroWall />;
    if (secId === "about" || secType === "about") return <AboutWall />;
    if (secId === "roadmap" || secId.includes("academic") || secType.includes("academic")) return <AcademicWall />;
    if (secId === "radar" || secType.includes("radar")) return <RadarWall />;
    if (secId === "skills" || secType.includes("skill")) return <SkillsWall />;
    if (secId === "experience" || secType.includes("experience")) return <ExperienceWall />;
    if (secId === "projects" || secType.includes("project")) return <ProjectsWall />;
    if (secId === "certifications" || secType.includes("certif")) return <CertificationsWall />;
    if (secId === "proof" || secType.includes("proof")) return <ProofWall />;
    if (secId === "contact" || secType.includes("contact")) return <ContactWall />;

    return <CustomWall section={section} />;
  };

  // Performance scoping: distant walls rendered as lightweight placeholders
  if (isDistant && !isActive && !isAdjacent) {
    return (
      <div
        onClick={onSelect}
        style={{
          transform: transform3D,
          transformStyle: "preserve-3d",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-5xl h-[calc(100vh-160px)] rounded-3xl border border-white/5 bg-[#06070a]/40 opacity-10 cursor-pointer pointer-events-auto"
      />
    );
  }

  return (
    <motion.div
      onClick={!isActive ? onSelect : undefined}
      style={{
        transform: transform3D,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity, filter",
      }}
      animate={{
        opacity: isActive ? 1 : isAdjacent ? 0.35 : 0.08,
        scale: isActive ? 1 : 0.92,
        filter: isActive
          ? "brightness(1) contrast(1.05) blur(0px)"
          : isAdjacent
          ? "brightness(0.45) contrast(0.8) blur(1px)"
          : "brightness(0.2) contrast(0.6) blur(4px)",
      }}
      transition={{
        duration: reducedMotion ? 0.3 : 0.65,
        ease: [0.25, 1, 0.35, 1],
      }}
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-5xl h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] transition-shadow duration-500 ${
        !isActive ? "cursor-pointer hover:opacity-60" : ""
      }`}
    >
      {/* Physical Architectural Exhibition Wall Panel Frame */}
      <div 
        className={`relative w-full h-full rounded-2xl md:rounded-3xl border transition-all duration-700 overflow-hidden flex flex-col ${
          isActive
            ? "border-[var(--accent)]/50 bg-[#090b10]/95 shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_var(--accent)]"
            : "border-white/10 bg-[#08090d]/80 shadow-2xl hover:border-white/20"
        }`}
      >
        {/* Dynamic Architectural Spotlight Emissive Bar */}
        <div 
          className="h-1 w-full transition-all duration-700 shrink-0 z-20"
          style={{
            background: isActive
              ? `linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)`
              : "rgba(255, 255, 255, 0.05)",
            opacity: spotlightIntensity,
          }}
        />

        {/* Wall Exhibition Surface (Houses Real Exhibition Wall Content Directly) */}
        <div className={`relative z-10 flex-1 overflow-hidden p-2 sm:p-4 lg:p-6 text-[var(--foreground)] ${
          isActive ? "pointer-events-auto" : "pointer-events-none select-none"
        }`}>
          <div className="relative z-10 w-full h-full">
            {renderWallContent()}
          </div>
        </div>

        {/* Corner Metallic Architectural Brackets */}
        <div className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/20 rounded-tl-sm z-30" />
        <div className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/20 rounded-tr-sm z-30" />
        <div className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/20 rounded-bl-sm z-30" />
        <div className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/20 rounded-br-sm z-30" />
      </div>
    </motion.div>
  );
}
