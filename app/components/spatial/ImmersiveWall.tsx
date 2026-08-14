"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { HomepageSectionConfig } from "@/app/lib/types";
import SectionRegistry from "../SectionRegistry";
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
  // Format wall number (e.g. EXHIBIT 01, EXHIBIT 02)
  const wallNumber = useMemo(() => {
    const num = wallIndex + 1;
    return num < 10 ? `0${num}` : `${num}`;
  }, [wallIndex]);

  const displayTitle = section.publicDisplayTitle || section.navLabel || section.id;

  // Section-specific metadata & iconography
  const sectionMeta = useMemo(() => {
    const type = (section.type || section.id).toLowerCase();
    if (type.includes("hero")) {
      return {
        tag: "PERSONAL IDENTITY",
        sub: "EXHIBIT INTRODUCTION",
        icon: <Box className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("about")) {
      return {
        tag: "BACKGROUND & IMPACT",
        sub: "CURATED PROFILE",
        icon: <Layers className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("roadmap") || type.includes("academic")) {
      return {
        tag: "ACADEMIC ROADMAP",
        sub: "EDUCATIONAL TIMELINE",
        icon: <Compass className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("radar")) {
      return {
        tag: "PORTFOLIO RADAR",
        sub: "SYSTEM INSTALLATION",
        icon: <Sparkles className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("skill")) {
      return {
        tag: "TECHNICAL CAPABILITIES",
        sub: "SKILLS MATRIX",
        icon: <Code className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("experience")) {
      return {
        tag: "CAREER HISTORY",
        sub: "PROFESSIONAL TIMELINE",
        icon: <Briefcase className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("project")) {
      return {
        tag: "FEATURED PROJECTS",
        sub: "SYSTEMS GALLERY",
        icon: <Code className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("certif")) {
      return {
        tag: "CERTIFICATIONS",
        sub: "CREDENTIAL GALLERY",
        icon: <Award className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("proof")) {
      return {
        tag: "PROOF EVIDENCE",
        sub: "INTERACTIVE DEMOS",
        icon: <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    if (type.includes("contact")) {
      return {
        tag: "CONNECT & HIRE",
        sub: "EXHIBIT CONCLUSION",
        icon: <Mail className="w-4 h-4 text-[var(--accent)]" />,
      };
    }
    return {
      tag: "CUSTOM EXHIBIT",
      sub: "SECTION PANEL",
      icon: <Box className="w-4 h-4 text-[var(--accent)]" />,
    };
  }, [section]);

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
        opacity: isActive ? 1 : isAdjacent ? 0.35 : 0.1,
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
      {/* Physical Architectural Exhibition Wall Frame */}
      <div 
        className={`relative w-full h-full rounded-2xl md:rounded-3xl border transition-all duration-700 overflow-hidden flex flex-col ${
          isActive
            ? "border-[var(--accent)]/50 bg-[#090b10]/95 shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_var(--accent)]"
            : "border-white/10 bg-[#08090d]/80 shadow-2xl hover:border-white/20"
        }`}
      >
        {/* Top Metallic Architectural Exhibition Header Bar */}
        <div className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b border-white/10 bg-gradient-to-r from-white/[0.06] via-white/[0.02] to-transparent backdrop-blur-md select-none shrink-0">
          {/* Wall Section Tag & Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span
                className={`block w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  isActive
                    ? "bg-[var(--accent)] shadow-[0_0_12px_var(--accent)] scale-110"
                    : "bg-white/30"
                }`}
              />
              {isActive && (
                <span className="absolute w-4 h-4 rounded-full border border-[var(--accent)] animate-ping opacity-75" />
              )}
            </div>
            
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold tracking-widest uppercase text-white/90">
              <span className="text-[var(--accent)]">EXHIBIT {wallNumber}</span>
              <span className="text-white/30">//</span>
              {sectionMeta.icon}
              <span className="tracking-wide text-white/90">{displayTitle}</span>
            </div>
          </div>

          {/* Spatial Room Subtitle & Wall Count */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-white/40">
            <span className="hidden sm:inline-block uppercase tracking-wider text-white/40">
              {sectionMeta.sub}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white/80 font-semibold">
              {wallNumber} / {totalWalls < 10 ? `0${totalWalls}` : totalWalls}
            </span>
          </div>
        </div>

        {/* Dynamic Architectural Spotlight Emissive Bar */}
        <div 
          className="h-0.5 w-full transition-all duration-700 shrink-0"
          style={{
            background: isActive
              ? `linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)`
              : "rgba(255, 255, 255, 0.05)",
            opacity: spotlightIntensity,
          }}
        />

        {/* Wall Exhibition Display Surface (Houses Real Section Content) */}
        <div className={`relative z-10 flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 lg:p-10 text-[var(--foreground)] ${
          isActive ? "pointer-events-auto" : "pointer-events-none select-none"
        }`}>
          <div className="relative z-10 mx-auto w-full">
            <SectionRegistry section={section} />
          </div>
        </div>

        {/* Corner Metallic Architectural Brackets */}
        <div className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/20 rounded-tl-sm" />
        <div className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/20 rounded-tr-sm" />
        <div className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/20 rounded-bl-sm" />
        <div className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/20 rounded-br-sm" />
      </div>
    </motion.div>
  );
}
