"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Menu, X, Sparkles } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { useMotionPreferences } from "./MotionProvider";

export default function Header() {
  const { content } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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
          // Don't render link if the section itself is set to invisible
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

    // Fallback if navItems array is missing: build from visible sections
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
    const syncActiveSection = () => {
      const nextSection = window.location.hash.replace(/^#/, "") || "home";
      setActiveSection(nextSection);
    };

    syncActiveSection();
    window.addEventListener("hashchange", syncActiveSection);

    return () => window.removeEventListener("hashchange", syncActiveSection);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const navigateToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    setActiveSection(sectionId);
    setIsOpen(false);

    if (!target) {
      window.history.pushState(null, "", `#${sectionId}`);
      return;
    }

    window.history.pushState(null, "", `#${sectionId}`);
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  return (
    <motion.header
      initial={reducedMotion ? false : { y: -100 }}
      animate={reducedMotion ? undefined : { y: 0 }}
      transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface)] border-b-2 border-[var(--foreground)] glass-surface"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ y: -2 }}
            className="text-2xl font-black tracking-tighter text-[var(--foreground)] select-none"
          >
            {siteCopy.headerBrand}
          </motion.div>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="font-bold text-[var(--foreground)] tracking-tight transition-all duration-300 hover:text-[var(--accent)]"
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="paper-button inline-flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              <Command className="h-4 w-4" />
              Quick Search
              <span className="ml-1 rounded border-2 border-[var(--foreground)]/30 px-1.5 py-0.5 text-[10px] font-bold">Ctrl K</span>
            </button>

            {/* Proof Mode Destination Button */}
            <motion.div
              whileHover={reducedMotion ? undefined : { y: -2, scale: 1.03 }}
              whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              transition={reducedMotion ? undefined : { type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/proof-mode"
                className="group relative inline-flex items-center gap-2 rounded-full border-2 border-[var(--foreground)] bg-[var(--surface-strong)] px-5 py-2.5 text-sm font-extrabold text-[var(--foreground)] shadow-[4px_4px_0_0_rgba(42,36,31,0.9)] transition-all duration-300 hover:bg-[var(--foreground)] hover:text-[var(--surface)] hover:shadow-[6px_6px_0_0_rgba(42,36,31,1)]"
              >
                <Sparkles className="h-4 w-4 text-[var(--accent)] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span>Proof Mode</span>
              </Link>
            </motion.div>

            <Link href="/hire" className="paper-button hover:!bg-[var(--accent)] hover:!border-[var(--accent)] hover:!text-[var(--surface)] px-6 py-2.5 text-sm">
              {siteCopy.headerHireCta}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="p-2 text-[var(--foreground)] md:hidden border-2 border-[var(--foreground)] rounded-xl bg-[var(--surface)]"
          >
            {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              id="mobile-nav-menu"
              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
              animate={reducedMotion ? undefined : { opacity: 1, height: "auto" }}
              exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.25, ease: [0.42, 0, 0.58, 1] }}
              className="mt-4 border-t-2 border-[var(--foreground)] pt-6 pb-4 md:hidden"
            >
              <nav aria-label="Mobile navigation" className="flex flex-col space-y-4 text-center">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => navigateToSection(item.sectionId)}
                    aria-current={activeSection === item.sectionId ? "page" : undefined}
                    className={`rounded-2xl border-2 px-4 py-3 text-xl font-bold tracking-tight transition-colors ${
                      activeSection === item.sectionId
                        ? "border-[var(--foreground)] bg-[var(--surface-soft)] text-[var(--foreground)]"
                        : "border-transparent text-[var(--foreground)]"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}

                <div className="pt-4 flex flex-col items-center gap-3 max-w-xs mx-auto w-full">
                  <Link
                    href="/proof-mode"
                    onClick={() => setIsOpen(false)}
                    className="group inline-flex items-center justify-center gap-2 w-full rounded-full border-2 border-[var(--foreground)] bg-[var(--surface-strong)] py-3 text-base font-extrabold text-[var(--foreground)] shadow-[4px_4px_0_0_rgba(42,36,31,0.9)] transition-all duration-300 hover:bg-[var(--foreground)] hover:text-[var(--surface)]"
                  >
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    <span>Proof Mode</span>
                  </Link>

                  <Link
                    href="/hire"
                    onClick={() => setIsOpen(false)}
                    className="paper-button hover:!bg-[var(--accent)] hover:!border-[var(--accent)] hover:!text-[var(--surface)] inline-block w-full py-3 text-center"
                  >
                    {siteCopy.headerHireCta}
                  </Link>
                </div>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}