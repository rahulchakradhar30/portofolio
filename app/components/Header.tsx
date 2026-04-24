"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Command, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteCopy } from "@/app/lib/siteCopy";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));

  useEffect(() => {
    const loadCopy = async () => {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        if (data.content) {
          setSiteCopy(getSiteCopy(data.content));
        }
      } catch {
        // Keep defaults if the content endpoint is unavailable.
      }
    };

    loadCopy();
  }, []);

  const navItems = [
    { name: siteCopy.navHome, href: "#home" },
    { name: siteCopy.navAbout, href: "#about" },
    { name: siteCopy.navRadar, href: "#radar" },
    { name: siteCopy.navSkills, href: "#skills" },
    { name: siteCopy.navProjects, href: "#projects" },
    { name: siteCopy.navHire, href: "/hire" },
    { name: siteCopy.navContact, href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-[#0b0f19]/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-black tracking-[0.24em] bg-gradient-to-r from-cyan-200 via-white to-indigo-300 bg-clip-text text-transparent"
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
                className="font-medium text-slate-200/80 transition-colors duration-200 hover:text-cyan-100"
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
            >
              <Command className="h-4 w-4" />
              Quick Search
              <span className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-slate-300">Ctrl K</span>
            </button>
            <Link href="/hire" className="rounded-full bg-[#22d3ee] px-6 py-2 font-semibold text-[#0b0f19] shadow-lg shadow-cyan-300/20 transition-all duration-300 hover:scale-[1.02]">
              {siteCopy.headerHireCta}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-cyan-100 md:hidden"
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
            className="mt-4 border-t border-white/8 pb-4 pt-4 md:hidden"
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-slate-200/80 transition-colors duration-200 hover:text-cyan-100"
                >
                  {item.name}
                </a>
              ))}
              <Link href="/hire" className="mt-4 rounded-full bg-[#22d3ee] px-6 py-2 font-semibold text-[#0b0f19] shadow-lg shadow-cyan-300/20">
                {siteCopy.headerHireCta}
              </Link>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}