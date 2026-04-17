"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";

const DEFAULT_HERO_DATA = {
  heroTitle: "RAHUL CHAKRADHAR PEREPOGU",
  heroSubtitle: "AI ENTHUSIAST | TECH LEARNER | CONTENT CREATOR | DIRECTOR",
  heroTagline: "Student at GITAM University, Bengaluru.",
  profileImage: "",
  bannerImage: "",
  resumeUrl: "",
  instagram: "https://www.instagram.com/rahul_chakradhar_30/?hl=en",
  linkedin: "https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/",
  github: "https://github.com/rahulchakradhar30",
};

export default function Hero() {
  const { reducedMotion } = useMotionPreferences();
  const [heroData, setHeroData] = useState(DEFAULT_HERO_DATA);
  const [siteCopy, setSiteCopy] = useState(getSiteCopy(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            setSiteCopy(getSiteCopy(data.content));
            setHeroData({
              heroTitle: data.content.heroTitle || DEFAULT_HERO_DATA.heroTitle,
              heroSubtitle: data.content.heroSubtitle || DEFAULT_HERO_DATA.heroSubtitle,
              heroTagline: data.content.heroTagline || DEFAULT_HERO_DATA.heroTagline,
              profileImage: data.content.profileImage || DEFAULT_HERO_DATA.profileImage,
              bannerImage: data.content.bannerImage || DEFAULT_HERO_DATA.bannerImage,
              resumeUrl: data.content.resumeUrl || DEFAULT_HERO_DATA.resumeUrl,
              instagram: data.content.instagram || DEFAULT_HERO_DATA.instagram,
              linkedin: data.content.linkedin || DEFAULT_HERO_DATA.linkedin,
              github: data.content.github || DEFAULT_HERO_DATA.github,
            });
          }
        } else {
          throw new Error('Failed to load hero content');
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
        setError(error instanceof Error ? error : new Error('Failed to load hero section'));
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  if (error) throw error;
  if (loading) return <LoadingSkeleton variant="hero" />;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.18)_0%,transparent_35%),radial-gradient(circle_at_85%_20%,rgba(251,191,36,0.14)_0%,transparent_32%),linear-gradient(140deg,#07101a_5%,#0b1c2c_52%,#07101a_100%)] pt-24 pb-16 sm:pt-28 lg:pt-36 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]"></div>

      {heroData.bannerImage ? (
        <div className="absolute inset-0 opacity-20">
          <Image src={heroData.bannerImage} alt="Hero backdrop" fill className="object-cover" priority />
        </div>
      ) : null}

      {/* Animated gradient orbs for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl opacity-0 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-violet-500/10 to-pink-500/10 rounded-full blur-3xl opacity-0 animate-pulse" style={{ animationDelay: "1s" }}></div>

      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 px-4 sm:px-6 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 2xl:px-24">
        <div className="order-2 lg:order-1">
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6 }}
            className="inline-block rounded-full border border-cyan-200/30 bg-cyan-100/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-sm hover:border-cyan-200/50 hover:bg-cyan-100/15 transition-all"
          >
            {siteCopy.heroBadge}
          </motion.span>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 transition-all">
            {siteCopy.heroEditorialBadge}
          </div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 34 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.75, delay: 0.1 }}
            className="mt-6 text-4xl font-black leading-[1.04] text-white sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl drop-shadow-lg"
          >
            {heroData.heroTitle}
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.7, delay: 0.2 }}
            className="mt-5 text-lg font-semibold text-cyan-100/90 sm:text-xl md:text-2xl lg:text-2xl drop-shadow-md"
          >
            {heroData.heroSubtitle}
          </motion.p>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6, delay: 0.3 }}
            className="mt-3 text-base font-medium text-cyan-200/70 sm:text-lg md:text-xl"
          >
            {heroData.heroTagline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center md:mt-12"
          >
            <a
              href="#projects"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-8 py-4 font-bold text-slate-950 transition-all hover:shadow-[0_20px_40px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 group"
            >
              <span>{siteCopy.heroCTA1}</span>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-cyan-300/50 px-8 py-4 font-bold text-cyan-100 transition-all hover:bg-cyan-500/10 hover:border-cyan-300 active:scale-95 group backdrop-blur-sm"
            >
              <span>{siteCopy.heroCTA2}</span>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            {heroData.resumeUrl && (
              <a
                href={heroData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 backdrop-blur-sm"
              >
                📄 Resume
              </a>
            )}
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center gap-6"
          >
            {heroData.github && (
              <a
                href={heroData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-cyan-100/70 hover:text-cyan-100 transition-colors group"
              >
                <span className="h-10 w-10 rounded-full border border-cyan-300/20 flex items-center justify-center group-hover:border-cyan-300/50 group-hover:bg-cyan-500/10 transition-all">
                  GitHub
                </span>
              </a>
            )}
            {heroData.linkedin && (
              <a
                href={heroData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-cyan-100/70 hover:text-cyan-100 transition-colors group"
              >
                <span className="h-10 w-10 rounded-full border border-cyan-300/20 flex items-center justify-center group-hover:border-cyan-300/50 group-hover:bg-cyan-500/10 transition-all">
                  LinkedIn
                </span>
              </a>
            )}
            {heroData.instagram && (
              <a
                href={heroData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-cyan-100/70 hover:text-cyan-100 transition-colors group"
              >
                <span className="h-10 w-10 rounded-full border border-cyan-300/20 flex items-center justify-center group-hover:border-cyan-300/50 group-hover:bg-cyan-500/10 transition-all">
                  IG
                </span>
              </a>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.86 }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={reducedMotion ? undefined : { duration: 0.85, delay: 0.2 }}
          className="order-1 flex justify-center lg:order-2 lg:justify-end"
        >
          <div className="relative h-[290px] w-[290px] sm:h-[360px] sm:w-[360px] xl:h-[430px] xl:w-[430px]">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-emerald-200/70"
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={reducedMotion ? undefined : { duration: 14, ease: 'linear', repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-[10%] rounded-full border border-cyan-200/60"
              animate={reducedMotion ? undefined : { rotate: -360 }}
              transition={reducedMotion ? undefined : { duration: 18, ease: 'linear', repeat: Infinity }}
            />
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
              transition={reducedMotion ? undefined : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-[18%] overflow-hidden rounded-full border-4 border-white/30 bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_20px_45px_rgba(0,0,0,0.38)]"
            >
              {heroData.profileImage ? (
                <Image src={heroData.profileImage} alt="Profile photo" fill className="object-cover" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_28%_24%,#dcfce7_0%,#67e8f9_35%,#0f172a_100%)]">
                  <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-800">Add Profile Image</span>
                </div>
              )}
            </motion.div>
            <div className="absolute -right-5 top-14 h-12 w-12 rounded-full bg-cyan-300/80 blur-[1px] sm:h-16 sm:w-16" />
            <div className="absolute -left-2 bottom-8 h-10 w-10 rounded-full bg-amber-300/80 blur-[1px] sm:h-14 sm:w-14" />
            <div className="absolute -bottom-3 left-6 right-6 rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-center backdrop-blur-md sm:-bottom-6 sm:left-10 sm:right-10">
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">{siteCopy.heroCurrentFocusLabel}</div>
              <div className="mt-1 text-sm font-bold text-white">{siteCopy.heroCurrentFocusText}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}