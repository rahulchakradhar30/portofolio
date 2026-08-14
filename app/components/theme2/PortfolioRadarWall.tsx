"use client";

import React from "react";
import PortfolioRadar from "../PortfolioRadar";
import { Radar } from "lucide-react";

export default function PortfolioRadarWall() {
  return (
    <div className="relative w-full h-full p-4 sm:p-8 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent)_0%,transparent_65%)] opacity-15 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <Radar className="w-3.5 h-3.5 text-[var(--accent)] animate-spin-slow" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // PORTFOLIO RADAR
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          LIVE CAPABILITY RADAR
        </div>
      </div>

      {/* Radar Host Container Frame */}
      <div className="relative z-10 w-full max-h-[600px] my-auto overflow-y-auto custom-scrollbar p-2 rounded-2xl bg-[#090b10]/90 border border-white/15 backdrop-blur-xl shadow-2xl">
        <PortfolioRadar />
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-2 border-t border-white/10">
        <div>RADAR EXHIBIT</div>
        <div className="hidden sm:block">INTERACTIVE INFORMATION MATRIX</div>
      </div>
    </div>
  );
}
