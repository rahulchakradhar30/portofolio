"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { UnifiedMotionBlurConfig, PortfolioContent, MotionBlurPreset } from "@/app/lib/types";
import { getResolvedMotionBlur } from "@/app/lib/motionBlurResolver";

interface MotionBlurWrapperProps {
  children: React.ReactNode;
  sectionId?: string;
  componentId?: string;
  rawConfig?: UnifiedMotionBlurConfig | Partial<PortfolioContent> | null;
  className?: string;
  forceActive?: boolean;
  presetOverride?: MotionBlurPreset;
  as?: React.ElementType;
}

export default function MotionBlurWrapper({
  children,
  sectionId,
  componentId,
  rawConfig,
  className = "",
  forceActive = false,
  presetOverride,
}: MotionBlurWrapperProps) {
  const resolution = getResolvedMotionBlur(rawConfig, sectionId, componentId);
  const effectivePreset = presetOverride || resolution.preset;
  const isEnabled = (resolution.enabled || forceActive) && effectivePreset !== "off";

  const [isTransitioning, setIsTransitioning] = useState(forceActive);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerBlurTransition = useCallback(() => {
    if (!isEnabled || prefersReducedMotion) return;
    setIsTransitioning(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, resolution.params.transitionDurationMs);
  }, [isEnabled, prefersReducedMotion, resolution.params.transitionDurationMs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener?.("change", handleChange);
    return () => {
      mediaQuery.removeEventListener?.("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (forceActive) {
      const timer = setTimeout(() => {
        triggerBlurTransition();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [forceActive, triggerBlurTransition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isEnabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const activeBlurRadius = forceActive || isTransitioning ? resolution.params.maxBlurPx : 0;

  return (
    <motion.div
      className={`relative transition-all ${className}`}
      onAnimationStart={triggerBlurTransition}
      onAnimationComplete={() => {
        setIsTransitioning(false);
      }}
      style={{
        filter: isTransitioning || forceActive ? `blur(${activeBlurRadius}px)` : "blur(0px)",
        transition: `filter ${resolution.params.transitionDurationMs}ms cubic-bezier(0.25, 1, 0.5, 1)`,
        willChange: isTransitioning ? "filter, transform" : "auto",
        transform: "translateZ(0)", // Force GPU hardware layer promotion
      }}
    >
      {children}
    </motion.div>
  );
}
