"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePortfolioContent } from "./PortfolioContentProvider";

type MotionMode = "system" | "full" | "reduced";

interface MotionContextValue {
  motionMode: MotionMode;
  reducedMotion: boolean;
  scrollEffectsEnabled: boolean;
  magnifierEnabled: boolean;
  cycleMotionMode: () => void;
  toggleMagnifier: () => void;
}

const MotionContext = createContext<MotionContextValue | null>(null);

const STORAGE_KEY = "portfolio-motion-mode";
const MAGNIFIER_STORAGE_KEY = "portfolio-magnifier-enabled";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const { content } = usePortfolioContent();

  const [motionMode, setMotionMode] = useState<MotionMode>(() => {
    if (typeof window === "undefined") return "full";
    const saved = window.localStorage.getItem(STORAGE_KEY) as MotionMode | null;
    return saved === "full" || saved === "system" || saved === "reduced" ? saved : "full";
  });
  const [magnifierEnabled, setMagnifierEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem(MAGNIFIER_STORAGE_KEY);
    return saved !== null ? saved === "true" : true;
  });
  const [systemReduced, setSystemReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(media.matches);
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, motionMode);
  }, [motionMode]);

  useEffect(() => {
    window.localStorage.setItem(MAGNIFIER_STORAGE_KEY, String(magnifierEnabled));
  }, [magnifierEnabled]);

  const dbScrollEffects = content ? content.scrollEffects !== false : true;

  const reducedMotion = motionMode === "reduced" || (motionMode === "system" && systemReduced);
  const scrollEffectsEnabled = dbScrollEffects && !reducedMotion;

  useEffect(() => {
    document.documentElement.setAttribute("data-motion", reducedMotion ? "reduced" : "full");
  }, [reducedMotion]);

  const cycleMotionMode = () => {
    setMotionMode((prev) => {
      if (prev === "system") return "full";
      if (prev === "full") return "reduced";
      return "system";
    });
  };

  const toggleMagnifier = () => {
    setMagnifierEnabled((prev) => !prev);
  };

  const value = useMemo(
    () => ({ motionMode, reducedMotion, scrollEffectsEnabled, magnifierEnabled, cycleMotionMode, toggleMagnifier }),
    [motionMode, reducedMotion, scrollEffectsEnabled, magnifierEnabled]
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotionPreferences() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error("useMotionPreferences must be used within MotionProvider");
  }
  return context;
}

export function getMotionLabel(mode: MotionMode) {
  if (mode === "system") return "Motion: System";
  if (mode === "full") return "Motion: Full";
  return "Motion: Reduced";
}
