"use client";

import React from "react";
import type { HomepageSectionConfig } from "@/app/lib/types";
import BlockRegistry from "../blocks/BlockRegistry";
import { Layers } from "lucide-react";

interface CustomWallProps {
  section: HomepageSectionConfig;
}

export default function CustomWall({ section }: CustomWallProps) {
  const blocks = section.blocks && section.blocks.length > 0 ? section.blocks : [];
  const title = section.publicDisplayTitle || section.navLabel || section.internalName || "Custom Section";

  return (
    <div className="relative w-full h-full p-6 sm:p-10 md:p-12 xl:p-16 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent)_0%,transparent_60%)] opacity-15 pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[#0d0f17]/80 backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white/90">
            EXHIBIT // {title.toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase text-white/50 tracking-wider">
          CUSTOM EXHIBIT
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-left my-2">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          {title}
        </h2>
        {section.subtitle && (
          <p className="mt-1 text-sm sm:text-base text-white/70">{section.subtitle}</p>
        )}
      </div>

      {/* Content Blocks Area */}
      <div className="relative z-10 w-full max-h-[500px] overflow-y-auto custom-scrollbar my-auto p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-left space-y-4">
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <BlockRegistry key={block.id} block={block} />
          ))
        ) : (
          <div className="p-8 text-center text-white/60 font-mono text-xs">
            This section exhibit is currently being configured.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
        <div>CUSTOM EXHIBIT</div>
        <div className="hidden sm:block">SAFE RENDERER</div>
      </div>
    </div>
  );
}
