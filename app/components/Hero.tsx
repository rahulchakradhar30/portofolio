"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import LoadingSkeleton from "./LoadingSkeleton";
import { useMotionPreferences } from "./MotionProvider";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
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
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#8be9de_0%,transparent_35%),radial-gradient(circle_at_85%_20%,#ffd6a5_0%,transparent_32%),linear-gradient(140deg,#0b1117_5%,#102032_52%,#0f1724_100%)] pt-28 pb-16 lg:pt-36 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]"></div>

      {heroData.bannerImage ? (
        <div className="absolute inset-0 opacity-20">
          <Image src={heroData.bannerImage} alt="Hero backdrop" fill className="object-cover" priority />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 px-4 sm:px-6 md:px-10 lg:grid-cols-2 lg:px-14 2xl:px-24">
        <div className="order-2 lg:order-1">
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.6 }}
            className="inline-block rounded-full border border-cyan-200/30 bg-cyan-100/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100"
          >
            Building Digital Impact
          </motion.span>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 34 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.75, delay: 0.1 }}
            className="mt-6 text-4xl font-black leading-[1.04] text-white sm:text-5xl md:text-6xl xl:text-7xl"
          >
            {heroData.heroTitle}
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 34 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.75, delay: 0.22 }}
            className="mt-5 max-w-2xl text-sm text-slate-200 sm:text-base md:text-lg"
          >
            {heroData.heroSubtitle}
          </motion.p>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 34 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.75, delay: 0.3 }}
            className="mt-3 text-base font-bold uppercase tracking-[0.24em] text-amber-200 sm:text-lg"
          >
            {heroData.heroTagline}
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 32 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/projects"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-7 py-3 text-sm font-bold text-[#082032] shadow-[0_14px_35px_rgba(52,211,153,0.35)] transition-transform hover:-translate-y-0.5"
            >
              Explore My Work
            </Link>
            <Link
              href="/hire"
              className="rounded-full border border-amber-200/60 bg-white/10 px-7 py-3 text-sm font-bold text-amber-100 backdrop-blur transition hover:bg-white/20"
            >
              Let&apos;s Collaborate
            </Link>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { duration: 0.65, delay: 0.55 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {[
              { label: 'Instagram', href: heroData.instagram },
              { label: 'LinkedIn', href: heroData.linkedin },
              { label: 'GitHub', href: heroData.github },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-cyan-100/35 bg-white/10 px-4 py-1.5 text-xs font-semibold text-cyan-50 transition hover:bg-white/20"
              >
                {item.label}
              </a>
            ))}

            {heroData.resumeUrl ? (
              <a
                href={heroData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-emerald-200/60 bg-emerald-300/20 px-4 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/30"
              >
                Resume
              </a>
            ) : null}
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}