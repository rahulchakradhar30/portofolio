"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { useIsMobile } from "./useViewport";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { ArrowRight, Sparkles, Layers3 } from "lucide-react";
import { usePortfolioContent } from "./PortfolioContentProvider";

const DEFAULT_HERO_DATA = {
  heroTitle: "Rahul Chakradhar",
  heroSubtitle: "I build AI-powered digital systems that combine technology, storytelling, and real-world impact.",
  heroTagline: "Focused on scalable platforms, intelligent tools, and impactful digital experiences.",
  profileImage: "",
  bannerImage: "",
  resumeUrl: "",
  instagram: "https://www.instagram.com/rahul_chakradhar_30/?hl=en",
  linkedin: "https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/",
  github: "https://github.com/rahulchakradhar30",
};

export default function Hero() {
  const { content, loading, error: _error } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const _isMobile = useIsMobile();

  const heroData = useMemo(() => {
    if (!content) return DEFAULT_HERO_DATA;
    return {
      heroTitle: content.heroTitle || DEFAULT_HERO_DATA.heroTitle,
      heroSubtitle: content.heroSubtitle || DEFAULT_HERO_DATA.heroSubtitle,
      heroTagline: content.heroTagline || DEFAULT_HERO_DATA.heroTagline,
      profileImage: content.profileImage || DEFAULT_HERO_DATA.profileImage,
      bannerImage: content.bannerImage || DEFAULT_HERO_DATA.bannerImage,
      resumeUrl: content.resumeUrl || DEFAULT_HERO_DATA.resumeUrl,
      instagram: content.instagram || DEFAULT_HERO_DATA.instagram,
      linkedin: content.linkedin || DEFAULT_HERO_DATA.linkedin,
      github: content.github || DEFAULT_HERO_DATA.github,
    };
  }, [content]);

  const siteCopy = useMemo(() => getSiteCopy(content), [content]);
  const isVisible = content ? content.sectionVisibility?.hero !== false : true;

  if (loading) return <LoadingSkeleton variant="hero" />;
  if (!isVisible) return null;

  return (
    <section className="relative min-h-screen overflow-hidden pt-24 pb-16 sm:pt-32 lg:pt-40 lg:pb-24">
      {heroData.bannerImage ? (
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)"
          }}
        >
          <Image src={heroData.bannerImage} alt="Hero backdrop" fill className="object-cover" priority />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 px-4 sm:px-6 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 2xl:px-24">
        <div className="order-2 lg:order-1">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
            className="inline-flex flex-wrap items-center gap-3"
          >
            <span className="paper-chip inline-flex items-center gap-2 tracking-[0.2em] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              {siteCopy.heroBadge}
            </span>
            <span className="paper-chip tracking-[0.2em] uppercase">
              {siteCopy.heroEditorialBadge}
            </span>
          </motion.div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.1, ease: [0.42, 0, 0.58, 1] }}
            className="mt-8 max-w-4xl text-5xl md:text-7xl xl:text-8xl"
          >
            {heroData.heroTitle}
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.2, ease: [0.42, 0, 0.58, 1] }}
            className="mt-8 max-w-3xl text-xl md:text-3xl font-bold tracking-tight leading-snug"
          >
            {heroData.heroSubtitle}
          </motion.p>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.3, ease: [0.42, 0, 0.58, 1] }}
            className="mt-6 max-w-2xl text-lg md:text-xl font-medium"
          >
            {heroData.heroTagline}
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.4, ease: [0.42, 0, 0.58, 1] }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center md:mt-12"
          >
            <a
              href="#projects"
              className="paper-button-primary group inline-flex items-center justify-center px-8 py-4 text-lg"
            >
              <span>{siteCopy.heroCTA1}</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            <a
              href="#contact"
              className="paper-button group inline-flex items-center justify-center px-8 py-4 text-lg"
            >
              <span>{siteCopy.heroCTA2}</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            {heroData.resumeUrl && (
              <a
                href={heroData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="paper-chip px-6 py-4 text-sm font-bold ml-0 sm:ml-4"
              >
                Resume
              </a>
            )}
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.5, ease: [0.42, 0, 0.58, 1] }}
            className="mt-12 grid gap-6 sm:grid-cols-3"
          >
            {siteCopy.heroSpotlights.map((item) => (
              <div key={item.title} className="paper-card glass-surface p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  <Layers3 className="h-4 w-4" />
                  {item.title}
                </div>
                <p className="mt-4 text-base font-medium">{item.copy}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={reducedMotion ? undefined : { duration: 0.8, delay: 0.2, ease: [0.42, 0, 0.58, 1] }}
          className="order-1 flex justify-center lg:order-2 lg:justify-end"
        >
          <div className="relative h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] xl:h-[500px] xl:w-[500px]">
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, -15, 0], rotate: [0, 1, 0] }}
              transition={reducedMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={reducedMotion ? undefined : { willChange: "transform" }}
              className="absolute inset-[10%] overflow-hidden rounded-3xl editorial-border editorial-shadow bg-[var(--surface)] z-10"
            >
              {heroData.profileImage ? (
                <Image src={heroData.profileImage} alt="Profile photo" fill className="object-cover" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--surface-soft)]">
                  <span className="px-6 text-center text-sm font-bold uppercase tracking-widest text-[var(--foreground)]">
                    Add Profile Image
                  </span>
                </div>
              )}
            </motion.div>
            
            {/* Handdrawn aesthetic elements around image */}
            <motion.div
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={reducedMotion ? undefined : { duration: 30, ease: "linear", repeat: Infinity }}
              style={reducedMotion ? undefined : { willChange: "transform" }}
              className="absolute inset-[2%] rounded-full border-2 border-dashed border-[var(--foreground)] opacity-20"
            />
            
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, 10, 0] }}
              transition={reducedMotion ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={reducedMotion ? undefined : { willChange: "transform" }}
              className="absolute -bottom-6 -left-6 z-20 rounded-2xl editorial-border editorial-shadow bg-[var(--surface)] p-5 text-center sm:-bottom-8 sm:left-4"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{siteCopy.heroCurrentFocusLabel}</div>
              <div className="mt-2 text-base font-black text-[var(--foreground)]">{siteCopy.heroCurrentFocusText}</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
