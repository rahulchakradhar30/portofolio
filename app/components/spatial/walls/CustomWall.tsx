"use client";

import React from "react";
import type { HomepageSectionConfig } from "@/app/lib/types";
import BlockRegistry from "../../blocks/BlockRegistry";
import { Box, CheckCircle } from "lucide-react";

export default function CustomWall({ section }: { section: HomepageSectionConfig }) {
  const displayTitle = section.publicDisplayTitle || section.navLabel || section.id;
  const blocks = section.blocks || [];

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5" />
            <span>CUSTOM EXHIBIT</span>
          </span>
          <span className="text-xs font-mono text-white/40">// {displayTitle.toUpperCase()}</span>
        </div>
        <div className="text-xs font-mono text-white/40">ADMIN SECTION</div>
      </div>

      {/* Body */}
      <div className="my-auto space-y-6 max-w-5xl w-full">
        <div>
          {section.subtitle && (
            <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-widest block mb-1">
              {section.subtitle}
            </span>
          )}
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            {displayTitle}
          </h2>
        </div>

        {/* Render Section Blocks */}
        {blocks.length > 0 ? (
          <div className="space-y-4 pt-2">
            {blocks.map((block) => (
              <BlockRegistry key={block.id} block={block} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 text-center font-mono text-xs text-white/50">
            NO CUSTOM BLOCKS ADDED YET FOR THIS SECTION.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>ADMIN CUSTOM EXHIBIT</span>
        </div>
        <div>EXHIBIT PANEL</div>
      </div>
    </div>
  );
}
