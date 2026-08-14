"use client";

import React, { useMemo } from "react";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { usePortfolioContent } from "../PortfolioContentProvider";

export default function SpatialFooter() {
  const { content } = usePortfolioContent();
  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  return (
    <footer className="fixed bottom-0 inset-x-0 z-30 h-10 px-4 sm:px-8 flex items-center justify-between border-t border-[var(--border-thin,rgba(255,255,255,0.08))] bg-[var(--surface)]/70 backdrop-blur-md text-[11px] font-mono text-[var(--foreground)] opacity-70 pointer-events-auto">
      <div className="flex items-center gap-3">
        <span>© {new Date().getFullYear()} {siteCopy.footerBrand || "RAHUL CHAKRADHAR"}</span>
        <span className="hidden sm:inline-block text-[var(--accent)]">•</span>
        <span className="hidden sm:inline-block">Spatial Cinematic Experience</span>
      </div>

      <div className="flex items-center gap-4">
        {content?.github && (
          <a
            href={content.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)] transition-colors"
          >
            GitHub
          </a>
        )}
        {content?.linkedin && (
          <a
            href={content.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)] transition-colors"
          >
            LinkedIn
          </a>
        )}
      </div>
    </footer>
  );
}
