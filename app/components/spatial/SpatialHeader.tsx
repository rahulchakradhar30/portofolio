"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Menu, X, Sparkles, Box, FileText } from "lucide-react";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { usePortfolioContent } from "../PortfolioContentProvider";

export default function SpatialHeader() {
  const { content } = usePortfolioContent();
  const [isOpen, setIsOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("home");

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const navItems = useMemo(() => {
    const defaultItems = [
      { name: siteCopy.navHome, href: "#home", sectionId: "home" },
      { name: siteCopy.navAbout, href: "#about", sectionId: "about" },
      { name: siteCopy.navAcademic, href: "#roadmap", sectionId: "roadmap" },
      { name: siteCopy.navRadar, href: "#radar", sectionId: "radar" },
      { name: siteCopy.navSkills, href: "#skills", sectionId: "skills" },
      { name: siteCopy.navProjects, href: "#projects", sectionId: "projects" },
      { name: siteCopy.navContact, href: "#contact", sectionId: "contact" },
    ];

    if (!content?.homepageConfig) return defaultItems;

    const { sections, navItems: configuredNavs } = content.homepageConfig;

    if (Array.isArray(configuredNavs) && configuredNavs.length > 0) {
      const items = configuredNavs
        .filter((item) => item.visibleInNav !== false)
        .sort((a, b) => a.order - b.order)
        .map((item) => {
          const sec = sections.find((s) => s.id === item.sectionId);
          if (sec && sec.visible === false) return null;
          const anchorId = item.sectionId === "hero" ? "home" : item.sectionId;
          return {
            name: item.navLabel || sec?.publicDisplayTitle || item.sectionId,
            href: `#${anchorId}`,
            sectionId: anchorId,
          };
        })
        .filter((item): item is { name: string; href: string; sectionId: string } => Boolean(item));

      return items.length > 0 ? items : defaultItems;
    }

    const activeSections = sections
      .filter((s) => s.visible !== false && s.visibleInNav !== false)
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const anchorId = s.id === "hero" ? "home" : s.id;
        return {
          name: s.navLabel || s.publicDisplayTitle || s.id,
          href: `#${anchorId}`,
          sectionId: anchorId,
        };
      });

    return activeSections.length > 0 ? activeSections : defaultItems;
  }, [content, siteCopy]);

  useEffect(() => {
    const updateHash = () => {
      const current = window.location.hash.replace(/^#/, "") || "home";
      setActiveHash(current);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        ctrlKey: true,
        bubbles: true,
      })
    );
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[70px] flex items-center px-4 sm:px-8 border-b border-[var(--border-thin,rgba(255,255,255,0.1))] bg-[var(--surface)]/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="#home" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-black tracking-tighter shadow-md group-hover:scale-105 transition-transform">
            <Box className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base text-[var(--foreground)] tracking-tight">
              {siteCopy.headerBrand || "RAHUL CHAKRADHAR"}
            </span>
            <span className="text-[9px] font-mono text-[var(--accent)] tracking-widest uppercase font-semibold">
              Spatial Cinematic Mode
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-[var(--surface-soft)]/60 px-3 py-1.5 rounded-full border border-[var(--border-thin,rgba(255,255,255,0.1))]">
          {navItems.map((item) => {
            const isActive = activeHash === item.sectionId;
            return (
              <a
                key={item.sectionId}
                href={item.href}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-sm font-semibold"
                    : "text-[var(--foreground)] opacity-70 hover:opacity-100 hover:bg-[var(--surface)]"
                }`}
              >
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/proof-mode"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border-thin)] hover:border-[var(--accent)] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Proof Mode</span>
          </Link>

          {content?.resumeUrl && (
            <a
              href={content.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border-thin)] hover:border-[var(--accent)] transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume</span>
            </a>
          )}

          <button
            onClick={triggerCommandPalette}
            aria-label="Open Command Palette"
            className="p-2 rounded-lg bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border-thin)] hover:border-[var(--accent)] transition-colors"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 rounded-lg bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border-thin)]"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[70px] inset-x-0 bg-[var(--surface)] border-b border-[var(--border-thin)] p-6 shadow-2xl lg:hidden flex flex-col gap-4"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.sectionId}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="pt-4 border-t border-[var(--border-thin)] flex items-center justify-between gap-3">
              <Link
                href="/proof-mode"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-[var(--accent)] text-white"
              >
                Proof Mode
              </Link>
              {content?.resumeUrl && (
                <a
                  href={content.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border-thin)]"
                >
                  Resume
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
