"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { useMotionPreferences } from "./MotionProvider";
import { SITE_NAME, PRIMARY_NAME } from "@/app/lib/seoSchemas";
import styles from "./IntroOverlay.module.css";

export default function IntroOverlay() {
  const { content, loading } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  const [shouldPlay, setShouldPlay] = useState(false);
  const [phase, setPhase] = useState<"loading" | "text" | "logo" | "exit" | "complete">("loading");
  
  // Guard references to ensure body scroll is restored
  const bodyLockedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    
    const introEnabled = content?.introEnabled !== false; // Default true if undefined? Actually, we'll assume it's disabled if not configured, or let's default to false unless explicitly enabled. Wait, let's default to false to be safe, or true for demonstration. The user asked for "Enable / Disable intro", let's default to true if it's the first time setting up. Let's do `content?.introEnabled === true`. Or `!== false` for default true. Let's use `!== false` for a premium feel by default.
    const isEnabled = content?.introEnabled === true || content?.introEnabled === undefined;
    
    if (!isEnabled) {
      setPhase("complete");
      return;
    }

    const firstLoadOnly = content?.introFirstLoadOnly !== false; // Default true
    const hasPlayed = sessionStorage.getItem("introPlayed");

    if (firstLoadOnly && hasPlayed) {
      setPhase("complete");
      return;
    }

    // Play intro
    setShouldPlay(true);
    setPhase("text");
    
    // Lock body scroll
    document.body.style.overflow = "hidden";
    bodyLockedRef.current = true;
    
    // Cleanup function to ensure scroll is unlocked
    return () => {
      if (bodyLockedRef.current) {
        document.body.style.overflow = "";
        bodyLockedRef.current = false;
      }
    };
  }, [loading, content]);

  // Sequence timing
  useEffect(() => {
    if (!shouldPlay || phase === "complete") return;

    // Use admin-configured duration, default to 3s total flow (text: 1.5s, logo: 1s, pause: 0.5s)
    // If they set a custom duration, we scale the internal phases relatively.
    const customDuration = content?.introDuration ? Number(content.introDuration) * 1000 : 3500;
    const textTime = customDuration * 0.45;
    const logoTime = customDuration * 0.35;
    const exitDelay = customDuration * 0.2;

    let timeout: NodeJS.Timeout;

    if (phase === "text") {
      timeout = setTimeout(() => setPhase("logo"), textTime);
    } else if (phase === "logo") {
      timeout = setTimeout(() => setPhase("exit"), logoTime);
    } else if (phase === "exit") {
      timeout = setTimeout(() => {
        setPhase("complete");
        sessionStorage.setItem("introPlayed", "true");
        if (bodyLockedRef.current) {
          document.body.style.overflow = "";
          bodyLockedRef.current = false;
        }
      }, exitDelay);
    }

    return () => clearTimeout(timeout);
  }, [phase, shouldPlay, content?.introDuration]);

  if (phase === "loading" || phase === "complete") return null;

  const brandText = content?.introBrandText || content?.siteCopy?.headerBrand || PRIMARY_NAME;
  const subtitle = content?.introSubtitle || "Portfolio";
  const logoUrl = content?.introLogoUrl || content?.profileImage;

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          key="intro-overlay"
          className={styles.overlay}
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: reducedMotion ? 0 : "-100%", 
          }}
          transition={{ 
            duration: reducedMotion ? 0.8 : 1.2, 
            ease: [0.76, 0, 0.24, 1] // Custom smooth bezier (similar to Apple/Linear)
          }}
        >
          <div className={styles.texture} />
          
          <div className={styles.content}>
            <AnimatePresence mode="wait">
              {phase === "text" && (
                <motion.div
                  key="text-phase"
                  initial={{ opacity: 0, filter: reducedMotion ? "none" : "blur(10px)", scale: reducedMotion ? 1 : 0.95 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: reducedMotion ? "none" : "blur(10px)", scale: reducedMotion ? 1 : 1.05 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <motion.h1 
                    className={styles.brandText}
                    style={{ color: content?.introAccentColor || "var(--foreground)" }}
                  >
                    {brandText}
                  </motion.h1>
                  {subtitle && (
                    <motion.p 
                      className={styles.subtitle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0.8, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {phase === "logo" && (
                <motion.div
                  key="logo-phase"
                  initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={styles.logoWrapper}
                >
                  {logoUrl ? (
                    <div className="relative h-24 w-24 md:h-32 md:w-32">
                      <Image 
                        src={logoUrl} 
                        alt={brandText} 
                        fill
                        className={styles.logoImage}
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-2xl bg-[var(--foreground)] text-[var(--background)] shadow-2xl">
                      <span className="text-4xl md:text-5xl font-black">
                        {brandText.charAt(0)}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
