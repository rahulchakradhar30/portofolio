"use client";

import { motion } from "framer-motion";
import { Heart, Code, Link, Hash, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteCopy } from "@/app/lib/siteCopy";

export default function Footer() {
  const currentYear = new Date().getFullYear();
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
        // Keep defaults.
      }
    };

    loadCopy();
  }, []);

  return (
    <footer className="relative overflow-hidden bg-gradient-to-r from-[#07101a] via-[#0b1f2e] to-[#07101a] text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-violet-300 rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-16 border border-pink-300 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 border border-green-300 rounded-full"></div>
      </div>

      <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-2"
            >
              <h3 className="mb-4 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-2xl font-black text-transparent">
                {siteCopy.footerBrand}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                {siteCopy.footerLead}
              </p>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 transition-colors duration-300 hover:bg-cyan-600"
                >
                  <Code className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 transition-colors duration-300 hover:bg-emerald-600"
                >
                  <Link className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 transition-colors duration-300 hover:bg-amber-500"
                >
                  <Hash className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="mailto:rahulchakradharperepogu@gmail.com"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 transition-colors duration-300 hover:bg-cyan-600"
                >
                  <Mail className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-4 text-white">{siteCopy.footerQuickLinksTitle}</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 transition-colors hover:text-cyan-300">{siteCopy.navAbout}</a></li>
                <li><a href="#radar" className="text-gray-400 transition-colors hover:text-cyan-300">{siteCopy.navRadar}</a></li>
                <li><a href="#skills" className="text-gray-400 transition-colors hover:text-cyan-300">{siteCopy.navSkills}</a></li>
                <li><a href="#projects" className="text-gray-400 transition-colors hover:text-cyan-300">{siteCopy.navProjects}</a></li>
                <li><a href="/hire" className="text-gray-400 transition-colors hover:text-cyan-300">{siteCopy.navHire}</a></li>
                <li><a href="#contact" className="text-gray-400 transition-colors hover:text-cyan-300">{siteCopy.navContact}</a></li>
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-4 text-white">{siteCopy.footerServicesTitle}</h4>
              <ul className="space-y-2">
                {siteCopy.footerServices.map((service) => (
                  <li key={service}><span className="text-gray-400">{service}</span></li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {siteCopy.footerCopyright.replace("{year}", String(currentYear))}
            </p>
            <p className="text-gray-400 text-sm flex items-center">
              {siteCopy.footerMadeWith} <Heart className="w-4 h-4 text-red-500 mx-1" />
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}