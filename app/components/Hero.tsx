"use client";

import { useEffect, useState, useMemo } from "react";
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
  const { content, loading, error } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const isMobile = useIsMobile();

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

  if (error) throw error;
  if (loading) return <LoadingSkeleton variant="hero" />;
  if (!isVisible) return null;

  return (
    <section className="relative min-h-screen overflow-hidden pt-24 pb-16 sm:pt-28 lg:pt-36 lg:pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(235,216,188,0.55)_0%,transparent_28%),radial-gradient(circle_at_82%_18%,rgba(196,168,132,0.22)_0%,transparent_26%),linear-gradient(180deg,#fbf7f0_0%,#f3eadc_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(122,95,71,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(122,95,71,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />

      {heroData.bannerImage ? <div className="absolute inset-0 opacity-[0.08]"><Image src={heroData.bannerImage} alt="Hero backdrop" fill className="object-cover" priority /></div> : null}

      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 px-4 sm:px-6 md:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-14 2xl:px-24">
        <div className="order-2 lg:order-1">
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, y: isMobile ? 14 : 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: isMobile ? 0.38 : 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/15 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a5f47] backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {siteCopy.heroBadge}
          </motion.span>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/10 bg-[#f7efe4]/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5f4a38] backdrop-blur-sm">
            {siteCopy.heroEditorialBadge}
          </div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: isMobile ? 18 : 34 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: isMobile ? 0.46 : 0.75, delay: isMobile ? 0.04 : 0.1, ease: "easeOut" }}
            className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] text-[#2f241b] sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl"
          >
            {heroData.heroTitle}
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: isMobile ? 16 : 30 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: isMobile ? 0.42 : 0.7, delay: isMobile ? 0.06 : 0.2, ease: "easeOut" }}
            className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-[#6f573f] sm:text-xl md:text-2xl"
          >
            {heroData.heroSubtitle}
          </motion.p>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: isMobile ? 12 : 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: isMobile ? 0.36 : 0.6, delay: isMobile ? 0.08 : 0.3, ease: "easeOut" }}
            className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#6a5846] sm:text-lg md:text-xl"
          >
            {heroData.heroTagline}
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: isMobile ? 14 : 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: isMobile ? 0.38 : 0.6, delay: isMobile ? 0.1 : 0.4, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-12"
          >
            <a
              href="#projects"
              className="premium-button-primary group inline-flex items-center justify-center rounded-full px-8 py-4 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{siteCopy.heroCTA1}</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            <a
              href="#contact"
              className="premium-button-secondary group inline-flex items-center justify-center rounded-full px-8 py-4 font-semibold transition-all duration-300 hover:border-[#8d6b4e]/30 hover:bg-[#f7efe4] active:scale-[0.98]"
            >
              <span>{siteCopy.heroCTA2}</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            {heroData.resumeUrl && (
              <a
                href={heroData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#7a5f47]/15 bg-white/75 px-6 py-3 text-sm font-semibold text-[#5f4a38] transition-all hover:border-[#8d6b4e]/25 hover:bg-[#f7efe4] backdrop-blur-sm"
              >
                Resume
              </a>
            )}
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: isMobile ? 12 : 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: isMobile ? 0.38 : 0.6, delay: isMobile ? 0.12 : 0.5, ease: "easeOut" }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            {heroData.github && (
              <a
                href={heroData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/15 bg-white/75 px-4 py-2 text-sm font-semibold text-[#5f4a38] transition-colors hover:border-[#8d6b4e]/30 hover:bg-[#f7efe4]"
              >
                GitHub
              </a>
            )}
            {heroData.linkedin && (
              <a
                href={heroData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/15 bg-white/75 px-4 py-2 text-sm font-semibold text-[#5f4a38] transition-colors hover:border-[#8d6b4e]/30 hover:bg-[#f7efe4]"
              >
                LinkedIn
              </a>
            )}
            {heroData.instagram && (
              <a
                href={heroData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#7a5f47]/15 bg-white/75 px-4 py-2 text-sm font-semibold text-[#5f4a38] transition-colors hover:border-[#8d6b4e]/30 hover:bg-[#f7efe4]"
              >
                Instagram
              </a>
            )}
          </motion.div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {siteCopy.heroSpotlights.map((item) => (
              <div key={item.title} className="premium-card rounded-3xl p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d6b4e]">
                  <Layers3 className="h-3.5 w-3.5" />
                  {item.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#6a5846]">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: isMobile ? 0.92 : 0.86 }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={reducedMotion ? undefined : { duration: isMobile ? 0.55 : 0.85, delay: isMobile ? 0.08 : 0.2, ease: "easeOut" }}
          className="order-1 flex justify-center lg:order-2 lg:justify-end"
        >
          <div className="relative h-[300px] w-[300px] sm:h-[380px] sm:w-[380px] xl:h-[460px] xl:w-[460px]">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(196,168,132,0.35)_0%,rgba(196,168,132,0.12)_34%,transparent_70%)] blur-2xl" />
            <motion.div
              className="absolute inset-[6%] rounded-full border border-[#8d6b4e]/25"
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={reducedMotion ? undefined : { duration: 18, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-[14%] rounded-full border border-[#7a5f47]/10"
              animate={reducedMotion ? undefined : { rotate: -360 }}
              transition={reducedMotion ? undefined : { duration: 24, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
              transition={reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[20%] overflow-hidden rounded-full border border-[#7a5f47]/10 bg-[linear-gradient(145deg,rgba(255,250,243,0.95)_0%,rgba(244,234,219,0.92)_100%)] shadow-[0_24px_70px_rgba(122,95,71,0.16)]"
            >
              {heroData.profileImage ? (
                <Image src={heroData.profileImage} alt="Profile photo" fill className="object-cover" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_24%,rgba(235,216,188,0.5)_0%,rgba(196,168,132,0.28)_38%,#f7efe4_100%)]">
                  <span className="px-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#5f4a38]">
                    Add Profile Image
                  </span>
                </div>
              )}
            </motion.div>
            <div className="absolute -right-2 top-16 h-14 w-14 rounded-full bg-[#c4a884]/25 blur-2xl" />
            <div className="absolute -left-4 bottom-12 h-14 w-14 rounded-full bg-[#e8d7bf]/40 blur-2xl" />
            <div className="absolute -bottom-2 left-6 right-6 rounded-3xl border border-[#7a5f47]/10 bg-white/90 p-4 text-center backdrop-blur-md sm:-bottom-6 sm:left-10 sm:right-10">
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8d6b4e]">{siteCopy.heroCurrentFocusLabel}</div>
              <div className="mt-1 text-sm font-semibold text-[#3a2e24]">{siteCopy.heroCurrentFocusText}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
