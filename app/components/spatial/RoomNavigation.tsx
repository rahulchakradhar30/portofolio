"use client";

import React from "react";
import type { HomepageSectionConfig } from "@/app/lib/types";
import { ChevronUp, ChevronDown, Compass, Sliders } from "lucide-react";

interface RoomNavigationProps {
  sections: HomepageSectionConfig[];
  activeIndex: number;
  onSelectWall: (index: number) => void;
  onNextWall: () => void;
  onPrevWall: () => void;
}

export default function RoomNavigation({
  sections,
  activeIndex,
  onSelectWall,
  onNextWall,
  onPrevWall,
}: RoomNavigationProps) {
  const currentSection = sections[activeIndex];
  const currentTitle = currentSection?.publicDisplayTitle || currentSection?.navLabel || currentSection?.id || "";

  return (
    <>
      {/* Right Side Wall Navigation Rail */}
      <nav 
        aria-label="Room Wall Navigation" 
        className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 p-2 sm:p-2.5 rounded-full border border-white/10 bg-[#0a0c10]/80 backdrop-blur-xl shadow-2xl select-none"
      >
        <button
          onClick={onPrevWall}
          disabled={activeIndex === 0}
          aria-label="Previous Exhibition Wall"
          className="p-1.5 rounded-full text-white/70 hover:text-[var(--accent)] hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2.5 my-1">
          {sections.map((sec, idx) => {
            const isCurrent = idx === activeIndex;
            const label = sec.publicDisplayTitle || sec.navLabel || sec.id;
            const wallNum = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

            return (
              <button
                key={sec.id}
                onClick={() => onSelectWall(idx)}
                aria-label={`Go to Wall ${wallNum}: ${label}`}
                title={`Wall ${wallNum}: ${label}`}
                className="group relative flex items-center justify-center p-1 focus:outline-none"
              >
                <span
                  className={`block rounded-full transition-all duration-500 ${
                    isCurrent
                      ? "w-3.5 h-3.5 bg-[var(--accent)] shadow-[0_0_12px_var(--accent)] scale-110"
                      : "w-2 h-2 bg-white/40 group-hover:bg-white/90 group-hover:scale-125"
                  }`}
                />
                {/* Wall Label Hover Tooltip */}
                <span className="absolute right-8 px-3 py-1.5 rounded-lg bg-[#0e1117] text-[11px] font-mono font-bold text-white shadow-2xl border border-white/15 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap flex items-center gap-2">
                  <span className="text-[var(--accent)]">WALL {wallNum}</span>
                  <span className="text-white/30">•</span>
                  <span>{label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onNextWall}
          disabled={activeIndex === sections.length - 1}
          aria-label="Next Exhibition Wall"
          className="p-1.5 rounded-full text-white/70 hover:text-[var(--accent)] hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </nav>

      {/* Bottom Left Spatial Room Compass & Controls Guide */}
      <div className="fixed bottom-4 left-4 sm:left-8 z-30 hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-[#0a0c10]/80 border border-white/10 text-[11px] font-mono text-white/70 backdrop-blur-xl shadow-2xl select-none">
        <div className="flex items-center gap-2 text-[var(--accent)] font-bold">
          <Compass className="w-4 h-4 animate-spin-slow" />
          <span>PORTFOLIO ROOM</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5 text-white/60">
          <Sliders className="w-3.5 h-3.5 text-white/40" />
          <span>Wall {activeIndex + 1}/{sections.length}: <strong className="text-white">{currentTitle}</strong></span>
        </div>
        <span className="text-white/20">|</span>
        <span className="text-white/40">Wheel / Arrow Keys / Drag</span>
      </div>
    </>
  );
}
