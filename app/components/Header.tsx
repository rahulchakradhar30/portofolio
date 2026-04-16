"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Hire", href: "/hire" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-100/30 bg-[#08111c]/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-black tracking-widest bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent"
          >
            PRC
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-medium text-cyan-50/90 transition-colors duration-200 hover:text-amber-200"
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          {/* CTA Button */}
          <Link href="/hire" className="hidden rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-2 font-semibold text-[#0c1c2d] shadow-lg shadow-emerald-300/30 transition-all duration-300 hover:shadow-xl md:block">
            Hire Me
          </Link>

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
            className="mt-4 border-t border-cyan-100/20 pb-4 pt-4 md:hidden"
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-cyan-50/90 transition-colors duration-200 hover:text-amber-200"
                >
                  {item.name}
                </a>
              ))}
              <Link href="/hire" className="mt-4 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-2 font-semibold text-[#0c1c2d] shadow-lg shadow-emerald-300/30">
                Hire Me
              </Link>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}