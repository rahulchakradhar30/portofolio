"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";
import { getSiteCopy } from "@/app/lib/siteCopy";
import { ArrowRight, Sparkles, Layers3, ShieldCheck } from "lucide-react";

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
    <section className="relative min-h-screen overflow-hidden pt-24 pb-16 sm:pt-28 lg:pt-36 lg:pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(34,211,238,0.12)_0%,transparent_28%),radial-gradient(circle_at_82%_18%,rgba(99,102,241,0.1)_0%,transparent_26%),linear-gradient(180deg,#0b0f19_0%,#090d16_100%)]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />

      {heroData.bannerImage ? <div className="absolute inset-0 opacity-[0.08]"><Image src={heroData.bannerImage} alt="Hero backdrop" fill className="object-cover" priority /></div> : null}

      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 px-4 sm:px-6 md:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-14 2xl:px-24">
        <div className="order-2 lg:order-1">
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {siteCopy.heroBadge}
          </motion.span>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/80 backdrop-blur-sm">
            {siteCopy.heroEditorialBadge}
          </div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 34 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.75, delay: 0.1 }}
            className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl"
          >
            {heroData.heroTitle}
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-cyan-100 sm:text-xl md:text-2xl"
          >
            {heroData.heroSubtitle}
          </motion.p>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6, delay: 0.3 }}
            className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg md:text-xl"
          >
            {heroData.heroTagline}
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6, delay: 0.4 }}
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
              className="premium-button-secondary group inline-flex items-center justify-center rounded-full px-8 py-4 font-semibold transition-all duration-300 hover:border-cyan-300/30 hover:bg-white/8 active:scale-[0.98]"
            >
              <span>{siteCopy.heroCTA2}</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            {heroData.resumeUrl && (
              <a
                href={heroData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition-all hover:border-cyan-300/25 hover:bg-white/10 backdrop-blur-sm"
              >
                Resume
              </a>
            )}
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            {heroData.github && (
              <a
                href={heroData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
              >
                GitHub
              </a>
            )}
            {heroData.linkedin && (
              <a
                href={heroData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
              >
                LinkedIn
              </a>
            )}
            {heroData.instagram && (
              <a
                href={heroData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/30 hover:bg-white/10"
              >
                Instagram
              </a>
            )}
          </motion.div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {siteCopy.heroSpotlights.map((item) => (
              <div key={item.title} className="premium-card rounded-3xl p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                  <Layers3 className="h-3.5 w-3.5" />
                  {item.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.86 }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={reducedMotion ? undefined : { duration: 0.85, delay: 0.2 }}
          className="order-1 flex justify-center lg:order-2 lg:justify-end"
        >
          <div className="relative h-[300px] w-[300px] sm:h-[380px] sm:w-[380px] xl:h-[460px] xl:w-[460px]">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.28)_0%,rgba(34,211,238,0.08)_34%,transparent_70%)] blur-2xl" />
            <motion.div
              className="absolute inset-[6%] rounded-full border border-cyan-300/30"
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={reducedMotion ? undefined : { duration: 18, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-[14%] rounded-full border border-white/10"
              animate={reducedMotion ? undefined : { rotate: -360 }}
              transition={reducedMotion ? undefined : { duration: 24, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
              transition={reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[20%] overflow-hidden rounded-full border border-white/10 bg-[linear-gradient(145deg,rgba(17,24,39,0.95)_0%,rgba(15,23,42,0.9)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
            >
              {heroData.profileImage ? (
                <Image src={heroData.profileImage} alt="Profile photo" fill className="object-cover" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_24%,rgba(34,211,238,0.2)_0%,rgba(99,102,241,0.22)_38%,#0f172a_100%)]">
                  <span className="px-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
                    Add Profile Image
                  </span>
                </div>
              )}
            </motion.div>
            <div className="absolute -right-2 top-16 h-14 w-14 rounded-full bg-cyan-300/20 blur-2xl" />
            <div className="absolute -left-4 bottom-12 h-14 w-14 rounded-full bg-indigo-400/20 blur-2xl" />
            <div className="absolute -bottom-2 left-6 right-6 rounded-3xl border border-white/10 bg-[#111827]/90 p-4 text-center backdrop-blur-md sm:-bottom-6 sm:left-10 sm:right-10">
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200/80">{siteCopy.heroCurrentFocusLabel}</div>
              <div className="mt-1 text-sm font-semibold text-slate-100">{siteCopy.heroCurrentFocusText}</div>
            </div>
            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/80 backdrop-blur-md md:inline-flex">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              Premium profile spotlight
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}