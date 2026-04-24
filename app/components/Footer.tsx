"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Code2, Heart, Link2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteCopy } from "@/app/lib/siteCopy";

const DEFAULT_SOCIALS = {
  email: "rahulchakradharperepogu@gmail.com",
  instagram: "https://www.instagram.com/rahul_chakradhar_30/?hl=en",
  linkedin: "https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/",
  github: "https://github.com/rahulchakradhar30",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));
  const [socials, setSocials] = useState(DEFAULT_SOCIALS);

  useEffect(() => {
    const loadCopy = async () => {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        if (data.content) {
          setSiteCopy(getSiteCopy(data.content));
          setSocials({
            email: data.content.email || DEFAULT_SOCIALS.email,
            instagram: data.content.instagram || DEFAULT_SOCIALS.instagram,
            linkedin: data.content.linkedin || DEFAULT_SOCIALS.linkedin,
            github: data.content.github || DEFAULT_SOCIALS.github,
          });
        }
      } catch {
        // Keep defaults.
      }
    };

    loadCopy();
  }, []);

  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-[#0b0f19] text-white">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-12 grid gap-8 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-2"
            >
              <h3 className="mb-4 bg-gradient-to-r from-cyan-200 via-white to-indigo-200 bg-clip-text text-2xl font-black text-transparent">
                {siteCopy.footerBrand}
              </h3>
              <p className="mb-6 max-w-md leading-relaxed text-slate-300">
                {siteCopy.footerLead}
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.a
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  <Code2 className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  <Link2 className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  <Camera className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={`mailto:${socials.email}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  <Mail className="h-5 w-5" />
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h4 className="mb-4 text-lg font-semibold text-white">{siteCopy.footerQuickLinksTitle}</h4>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="#about" className="transition hover:text-cyan-100">{siteCopy.navAbout}</Link></li>
                <li><Link href="#radar" className="transition hover:text-cyan-100">{siteCopy.navRadar}</Link></li>
                <li><Link href="#skills" className="transition hover:text-cyan-100">{siteCopy.navSkills}</Link></li>
                <li><Link href="#projects" className="transition hover:text-cyan-100">{siteCopy.navProjects}</Link></li>
                <li><Link href="/hire" className="transition hover:text-cyan-100">{siteCopy.navHire}</Link></li>
                <li><Link href="#contact" className="transition hover:text-cyan-100">{siteCopy.navContact}</Link></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className="mb-4 text-lg font-semibold text-white">{siteCopy.footerServicesTitle}</h4>
              <ul className="space-y-2 text-slate-300">
                {siteCopy.footerServices.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-start justify-between gap-4 border-t border-white/8 pt-8 md:flex-row md:items-center"
          >
            <p className="text-sm text-slate-400">
              {siteCopy.footerCopyright.replace("{year}", String(currentYear))}
            </p>
            <p className="flex items-center text-sm text-slate-400">
              {siteCopy.footerMadeWith} <Heart className="mx-1 h-4 w-4 text-cyan-300" />
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
