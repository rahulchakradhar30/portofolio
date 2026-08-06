"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Menu, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { useMotionPreferences } from "./MotionProvider";

export default function Header() {
  const { content } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const [isOpen, setIsOpen] = useState(false);

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const navItems = [
    { name: siteCopy.navHome, href: "#home" },
    { name: siteCopy.navAbout, href: "#about" },
    { name: siteCopy.navAcademic, href: "#roadmap" },
    { name: siteCopy.navRadar, href: "#radar" },
    { name: siteCopy.navSkills, href: "#skills" },
    { name: siteCopy.navProjects, href: "#projects" },
    { name: siteCopy.navContact, href: "#contact" },
  ];

  return (
    <motion.header
      initial={reducedMotion ? false : { y: -100 }}
      animate={reducedMotion ? undefined : { y: 0 }}
      transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface)] border-b-2 border-[var(--foreground)]"
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
          <nav className="hidden md:flex space-x-8">
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

          <div className="hidden items-center gap-4 md:flex">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="paper-button inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              <Command className="h-4 w-4" />
              Quick Search
              <span className="ml-1 rounded border-2 border-[var(--foreground)] px-1.5 py-0.5 text-[10px] font-bold">Ctrl K</span>
            </button>
            <Link href="/hire" className="paper-button-primary px-6 py-2.5 text-sm">
              {siteCopy.headerHireCta}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[var(--foreground)] md:hidden border-2 border-[var(--foreground)] rounded-xl bg-[var(--surface)]"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
              animate={reducedMotion ? undefined : { opacity: 1, height: "auto" }}
              exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.25, ease: [0.42, 0, 0.58, 1] }}
              className="mt-4 border-t-2 border-[var(--foreground)] pt-6 pb-4 md:hidden"
            >
              <nav className="flex flex-col space-y-6 text-center">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="font-bold text-xl text-[var(--foreground)] tracking-tight"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4">
                  <Link href="/hire" className="paper-button-primary inline-block w-full max-w-xs mx-auto py-3">
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