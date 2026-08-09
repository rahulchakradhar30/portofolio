"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Code2, Heart, Link2, Mail } from "lucide-react";
import { useMemo } from "react";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

const DEFAULT_SOCIALS = {
  email: "rahulchakradharperepogu@gmail.com",
  instagram: "https://www.instagram.com/rahul_chakradhar_30/?hl=en",
  linkedin: "https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/",
  github: "https://github.com/rahulchakradhar30",
};

export default function Footer() {
  const { content } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const currentYear = new Date().getFullYear();

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);

  const socials = useMemo(() => {
    if (!content) return DEFAULT_SOCIALS;
    return {
      email: content.email || DEFAULT_SOCIALS.email,
      instagram: content.instagram || DEFAULT_SOCIALS.instagram,
      linkedin: content.linkedin || DEFAULT_SOCIALS.linkedin,
      github: content.github || DEFAULT_SOCIALS.github,
    };
  }, [content]);

  return (
    <footer className="relative overflow-hidden border-t-2 border-[var(--foreground)] bg-[var(--surface-strong)] text-[var(--foreground)]">
      <div className="relative z-10 px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-16 grid gap-12 md:grid-cols-4">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <h3 className="mb-6 text-3xl font-black tracking-tighter">
                {siteCopy.footerBrand}
              </h3>
              <p className="mb-8 max-w-md text-lg font-medium">
                {siteCopy.footerLead}
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.a
                  whileHover={reducedMotion ? undefined : { y: -4 }}
                  whileTap={reducedMotion ? undefined : { y: 0 }}
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="paper-card inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--foreground)]"
                >
                  <Code2 className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { y: -4 }}
                  whileTap={reducedMotion ? undefined : { y: 0 }}
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="paper-card inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--foreground)]"
                >
                  <Link2 className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { y: -4 }}
                  whileTap={reducedMotion ? undefined : { y: 0 }}
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram profile"
                  className="paper-card inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--foreground)]"
                >
                  <Camera className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={reducedMotion ? undefined : { y: -4 }}
                  whileTap={reducedMotion ? undefined : { y: 0 }}
                  href={`mailto:${socials.email}`}
                  aria-label="Send email"
                  className="paper-card inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--foreground)]"
                >
                  <Mail className="h-6 w-6" />
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.1, ease: [0.42, 0, 0.58, 1] }}
              viewport={{ once: true }}
            >
              <h4 className="mb-6 text-xl font-bold tracking-tight">{siteCopy.footerQuickLinksTitle}</h4>
              <ul className="space-y-4 font-semibold">
                <li><Link href="#about" className="transition hover:text-[var(--accent)]">{siteCopy.navAbout}</Link></li>
                <li><Link href="#radar" className="transition hover:text-[var(--accent)]">{siteCopy.navRadar}</Link></li>
                <li><Link href="#skills" className="transition hover:text-[var(--accent)]">{siteCopy.navSkills}</Link></li>
                <li><Link href="#projects" className="transition hover:text-[var(--accent)]">{siteCopy.navProjects}</Link></li>
                <li><Link href="/hire" className="transition hover:text-[var(--accent)]">{siteCopy.navHire}</Link></li>
                <li><Link href="#contact" className="transition hover:text-[var(--accent)]">{siteCopy.navContact}</Link></li>
              </ul>
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.2, ease: [0.42, 0, 0.58, 1] }}
              viewport={{ once: true }}
            >
              <h4 className="mb-6 text-xl font-bold tracking-tight">{siteCopy.footerServicesTitle}</h4>
              <ul className="space-y-4 font-semibold">
                {siteCopy.footerServices.map((service: string) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            whileInView={reducedMotion ? undefined : { opacity: 1 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col items-start justify-between gap-4 border-t-2 border-[var(--foreground)] pt-8 md:flex-row md:items-center"
          >
            <p className="font-bold">
              {siteCopy.footerCopyright.replace("{year}", String(currentYear))}
            </p>
            <p className="flex items-center font-bold">
              {siteCopy.footerMadeWith} <Heart className="mx-2 h-5 w-5 text-[var(--accent)]" />
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
