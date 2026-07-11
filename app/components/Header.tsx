"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Command, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteCopy } from "@/app/lib/siteCopy";

import { useMemo } from "react";
import { usePortfolioContent } from "./PortfolioContentProvider";

export default function Header() {
  const { content } = usePortfolioContent();
  const [isOpen, setIsOpen] = useState(false);

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const navItems = [
    { name: siteCopy.navHome, href: "#home" },
    { name: siteCopy.navAbout, href: "#about" },
    { name: "Academic Track", href: "#roadmap" },
    { name: siteCopy.navRadar, href: "#radar" },
    { name: siteCopy.navSkills, href: "#skills" },
    { name: siteCopy.navProjects, href: "#projects" },
    { name: siteCopy.navContact, href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#7a5f47]/10 bg-[#fbf7f0]/90 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-black tracking-[0.24em] bg-gradient-to-r from-[#7a5f47] via-[#b6926d] to-[#9b7a5b] bg-clip-text text-transparent"
          >
            {siteCopy.headerBrand}
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-medium text-[#5f4a38] transition-colors duration-200 hover:text-[#8d6b4e]"
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/15 bg-white px-4 py-2 text-xs font-semibold text-[#5f4a38] transition hover:border-[#8d6b4e]/30 hover:bg-[#f7efe4]"
            >
              <Command className="h-4 w-4" />
              Quick Search
              <span className="rounded border border-[#7a5f47]/15 px-1.5 py-0.5 text-[10px] text-[#7a5f47]">Ctrl K</span>
            </button>
            <Link href="/hire" className="rounded-full bg-[#8d6b4e] px-6 py-2 font-semibold text-[#fffaf3] shadow-lg shadow-[rgba(122,95,71,0.18)] transition-all duration-300 hover:scale-[1.02]">
              {siteCopy.headerHireCta}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#8d6b4e] md:hidden"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-[#7a5f47]/10 pb-4 pt-4 md:hidden"
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-[#5f4a38] transition-colors duration-200 hover:text-[#8d6b4e]"
                >
                  {item.name}
                </a>
              ))}
              <Link href="/hire" className="mt-4 rounded-full bg-[#8d6b4e] px-6 py-2 font-semibold text-[#fffaf3] shadow-lg shadow-[rgba(122,95,71,0.18)]">
                {siteCopy.headerHireCta}
              </Link>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}