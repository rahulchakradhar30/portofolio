"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type MotionMode = "system" | "full" | "reduced";

interface MotionContextValue {
  motionMode: MotionMode;
  reducedMotion: boolean;
  cycleMotionMode: () => void;
}

const MotionContext = createContext<MotionContextValue | null>(null);

const STORAGE_KEY = "portfolio-motion-mode";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [motionMode, setMotionMode] = useState<MotionMode>(() => {
    if (typeof window === "undefined") return "full";
    const saved = window.localStorage.getItem(STORAGE_KEY) as MotionMode | null;
    if (saved === "reduced") return "full";
    return saved === "full" || saved === "system" ? saved : "full";
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

  const reducedMotion = motionMode === "reduced" || (motionMode === "system" && systemReduced);

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

  const value = useMemo(
    () => ({ motionMode, reducedMotion, cycleMotionMode }),
    [motionMode, reducedMotion]
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
