"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { useMotionPreferences } from "./MotionProvider";
import { SITE_NAME, PRIMARY_NAME } from "@/app/lib/seoSchemas";
import styles from "./IntroOverlay.module.css";

export default function IntroOverlay({ children }: { children?: React.ReactNode }) {
  const { content, loading } = usePortfolioContent();
  const { reducedMotion } = useMotionPreferences();
  
  const [mounted, setMounted] = useState(false);
  
  // 'ssr': Server-side or initial hydration, where we hide children to prevent layout flashes.
  // 'playing': Intro is active and playing.
  // 'done': Intro has finished or was skipped, show homepage normally.
  const [status, setStatus] = useState<"ssr" | "playing" | "done">("ssr");
  
  const [phase, setPhase] = useState<"text" | "logo" | "exit" | "complete">("text");
  
  // Guard references to ensure body scroll is restored
  const bodyLockedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const isEnabled = content?.introEnabled !== false;
    if (!isEnabled) {
      setStatus("done");
      return;
    }

    const firstLoadOnly = content?.introFirstLoadOnly !== false; // Default true
    const hasPlayed = sessionStorage.getItem("introPlayed");

    if (firstLoadOnly && hasPlayed) {
      setStatus("done");
      return;
    }

    // Initialize Intro
    setStatus("playing");
    setPhase("text");
    
    // Lock body scroll
    document.body.style.overflow = "hidden";
    bodyLockedRef.current = true;
    
    return () => {
      if (bodyLockedRef.current) {
        document.body.style.overflow = "";
        bodyLockedRef.current = false;
      }
    };
  }, [loading, content]);

  // Sequence timing
  useEffect(() => {
    if (status !== "playing" || phase === "complete") return;

    const customDuration = content?.introDuration ? Number(content.introDuration) * 1000 : 3500;
    
    const logoUrl = content?.introLogoUrl || content?.profileImage;
    const enableLogoAnimation = content?.introEnableLogoAnimation !== false;
    const hasLogoPhase = enableLogoAnimation && !!logoUrl;

    // Adjust timing based on whether logo phase exists
    const textTime = hasLogoPhase ? customDuration * 0.45 : customDuration * 0.8;
    const logoTime = hasLogoPhase ? customDuration * 0.35 : 0;
    const exitDelay = customDuration * 0.2;

    let timeout: NodeJS.Timeout;

    if (phase === "text") {
      timeout = setTimeout(() => {
        setPhase(hasLogoPhase ? "logo" : "exit");
      }, textTime);
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
        setStatus("done");
      }, exitDelay);
    }

    return () => clearTimeout(timeout);
  }, [phase, status, content]);

  const brandText = content?.introBrandText || content?.siteCopy?.headerBrand || PRIMARY_NAME;
  const subtitle = content?.introSubtitle || "Portfolio";
  const logoUrl = content?.introLogoUrl || content?.profileImage;
  const hasLogoPhase = (content?.introEnableLogoAnimation !== false) && !!logoUrl;

  const renderIntroOverlay = () => {
    if (status !== "playing") return null;

    return (
      <AnimatePresence>
        {phase !== "exit" && phase !== "complete" && (
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
              ease: [0.76, 0, 0.24, 1] 
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

                {phase === "logo" && hasLogoPhase && (
                  <motion.div
                    key="logo-phase"
                    initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={styles.logoWrapper}
                  >
                    <div className="relative h-24 w-24 md:h-32 md:w-32">
                      <Image 
                        src={logoUrl} 
                        alt={brandText} 
                        fill
                        className={styles.logoImage}
                        priority
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      {status !== "done" && renderIntroOverlay()}
      
      {/* 
        Instead of unmounting children while the intro plays (which breaks Framer Motion's whileInView state when remounted),
        we keep them mounted but use display: 'none' during the 'ssr' and 'playing' phases.
        Because display: 'none' removes the elements from the layout tree, Intersection Observer does NOT fire.
        When the intro finishes, display becomes 'contents', the elements get layout boxes, Intersection Observer fires,
        and Framer Motion triggers the initial animations precisely when they become visible!
      */}
      <div 
        style={
          status !== "done" 
            ? { display: 'none' } 
            : { display: 'contents' }
        }
      >
        {children}
      </div>
    </>
  );
}
