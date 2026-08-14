"use client";

import React from "react";
import type { HomepageSectionConfig } from "@/app/lib/types";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";

interface RoomHUDProps {
  sections: HomepageSectionConfig[];
  activeWallIndex: number;
  isTransitioning: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSelectWall: (index: number) => void;
}

export default function RoomHUD({
  sections,
  activeWallIndex,
  isTransitioning: _isTransitioning,
  onNext,
  onPrev,
  onSelectWall,
}: RoomHUDProps) {
  const currentSection = sections[activeWallIndex] || sections[0];
  const sectionTitle = currentSection?.publicDisplayTitle || currentSection?.navLabel || "HERO";
  const sectionNumber = String(activeWallIndex + 1).padStart(2, "0");
  const totalSections = String(sections.length || 1).padStart(2, "0");

  return (
    <div className="absolute inset-x-0 bottom-6 z-30 pointer-events-none px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      {/* Left: Active Section Label Badge */}
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0c0e17]/85 border border-white/15 backdrop-blur-xl shadow-2xl">
        <Compass className="w-4 h-4 text-[var(--accent)] animate-spin-slow" />
        <div className="flex items-center gap-2 font-mono text-xs text-white/90 font-bold uppercase tracking-wider">
          <span className="text-[var(--accent)]">
            EXHIBIT {sectionNumber}/{totalSections}
          </span>
          <span className="text-white/30">{"//"}</span>
          <span className="text-white tracking-widest">{sectionTitle}</span>
        </div>
      </div>

      {/* Center/Right: Interactive Wall Indicators & Navigation Controls */}
      <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c0e17]/85 border border-white/15 backdrop-blur-xl shadow-2xl">
        {/* Previous Wall Button */}
        <button
          type="button"
          onClick={onPrev}
          aria-label="Rotate to Previous Wall"
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Section Pill Buttons */}
        <div className="hidden md:flex items-center gap-1 px-1">
          {sections.map((sec, idx) => {
            const isActive = idx === activeWallIndex;
            const label = sec.navLabel || sec.publicDisplayTitle || `WALL ${idx + 1}`;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectWall(idx)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[var(--accent)] text-black shadow-[0_0_15px_var(--accent)] scale-105"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {String(idx + 1).padStart(2, "0")} {label}
              </button>
            );
          })}
        </div>

        {/* Mobile Wall Indicator Counter */}
        <div className="md:hidden font-mono text-xs font-bold text-white/80 px-2">
          {sectionNumber} / {totalSections}
        </div>

        {/* Next Wall Button */}
        <button
          type="button"
          onClick={onNext}
          aria-label="Rotate to Next Wall"
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
