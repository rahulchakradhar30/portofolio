"use client";

import React from "react";
import { Sparkles, Compass } from "lucide-react";
import PortfolioRadar from "../../PortfolioRadar";

export default function RadarWall() {
  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXHIBIT 04</span>
          </span>
          <span className="text-xs font-mono text-white/40">// PORTFOLIO RADAR</span>
        </div>
        <div className="text-xs font-mono text-white/40">SYSTEM INSTALLATION</div>
      </div>

      {/* Radar Visualizer Container */}
      <div className="my-auto w-full">
        <PortfolioRadar />
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>INTERACTIVE RADAR INSTALLATION</span>
        </div>
        <div>EXHIBIT PANEL 04</div>
      </div>
    </div>
  );
}
