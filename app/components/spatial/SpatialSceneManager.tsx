"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { HomepageSectionConfig } from "@/app/lib/types";
import SpatialScene from "./SpatialScene";
import { useMotionPreferences } from "../MotionProvider";
import { ChevronUp, ChevronDown, Compass } from "lucide-react";

interface SpatialSceneManagerProps {
  sections: HomepageSectionConfig[];
  motionBlurEnabled?: boolean;
}

export default function SpatialSceneManager({
  sections,
  motionBlurEnabled = false,
}: SpatialSceneManagerProps) {
  const { reducedMotion } = useMotionPreferences();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isTransitioningRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const wheelDeltaAccumulator = useRef<number>(0);

  // Sync hash to scene index
  const updateSceneFromHash = useCallback(() => {
    if (typeof window === "undefined" || sections.length === 0) return;
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (!hash) return;

    const foundIdx = sections.findIndex((sec) => {
      const idMatch = sec.id.toLowerCase() === hash;
      const navMatch = (sec.navLabel || "").toLowerCase().replace(/\s+/g, "-") === hash;
      return idMatch || navMatch;
    });

    if (foundIdx !== -1) {
      setActiveIndex(foundIdx);
    }
  }, [sections]);

  useEffect(() => {
    queueMicrotask(() => updateSceneFromHash());
    window.addEventListener("hashchange", updateSceneFromHash);
    return () => window.removeEventListener("hashchange", updateSceneFromHash);
  }, [updateSceneFromHash]);

  // Transition helper with cooldown lock
  const changeScene = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= sections.length) return;
      if (isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      setActiveIndex(newIndex);

      // Update location hash without triggering jarring scroll jumps
      const targetSec = sections[newIndex];
      if (targetSec && typeof window !== "undefined") {
        const hash = `#${targetSec.id}`;
        if (window.location.hash !== hash) {
          window.history.replaceState(null, "", hash);
        }
      }

      // Transition lock duration
      const cooldownDuration = reducedMotion ? 300 : 650;
      setTimeout(() => {
        isTransitioningRef.current = false;
        wheelDeltaAccumulator.current = 0;
      }, cooldownDuration);
    },
    [sections, reducedMotion]
  );

  const goToNextScene = useCallback(() => {
    if (activeIndex < sections.length - 1) {
      changeScene(activeIndex + 1);
    }
  }, [activeIndex, sections.length, changeScene]);

  const goToPrevScene = useCallback(() => {
    if (activeIndex > 0) {
      changeScene(activeIndex - 1);
    }
  }, [activeIndex, changeScene]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept inputs inside text fields or textareas
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goToNextScene();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToPrevScene();
      } else if (e.key === "Home") {
        e.preventDefault();
        changeScene(0);
      } else if (e.key === "End") {
        e.preventDefault();
        changeScene(sections.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextScene, goToPrevScene, changeScene, sections.length]);

  // Mouse wheel listener with velocity thresholding
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If user is scrolling inside a scene modal card that has overflow scroll content, let it scroll unless at bounds
      const scrollableContainer = (e.target as HTMLElement | null)?.closest(".overflow-y-auto");
      if (scrollableContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;

        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 4;
        const isAtTop = scrollTop < 4;

        if (isScrollingDown && !isAtBottom) return;
        if (isScrollingUp && !isAtTop) return;
      }

      e.preventDefault();
      wheelDeltaAccumulator.current += e.deltaY;

      const SCROLL_THRESHOLD = 50;
      if (wheelDeltaAccumulator.current > SCROLL_THRESHOLD) {
        goToNextScene();
        wheelDeltaAccumulator.current = 0;
      } else if (wheelDeltaAccumulator.current < -SCROLL_THRESHOLD) {
        goToPrevScene();
        wheelDeltaAccumulator.current = 0;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goToNextScene, goToPrevScene]);

  // Touch swipe gesture listener
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartYRef.current - touchEndY;

      const SWIPE_THRESHOLD = 45;
      if (deltaY > SWIPE_THRESHOLD) {
        goToNextScene();
      } else if (deltaY < -SWIPE_THRESHOLD) {
        goToPrevScene();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goToNextScene, goToPrevScene]);

  return (
    <div className="relative w-full h-[calc(100dvh-70px)] mt-[70px] overflow-hidden flex items-center justify-center select-none">
      {/* Scenes Container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {sections.map((section, idx) => (
          <SpatialScene
            key={section.id}
            section={section}
            index={idx}
            activeIndex={activeIndex}
            totalScenes={sections.length}
            motionBlurEnabled={motionBlurEnabled}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Spatial Scene Rail (Right Side Floating Navigation Index) */}
      <nav 
        aria-label="Spatial Scene Navigation" 
        className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 p-2.5 rounded-full border border-[var(--border-thin,rgba(255,255,255,0.15))] bg-[var(--surface)]/70 backdrop-blur-md shadow-xl"
      >
        <button
          onClick={goToPrevScene}
          disabled={activeIndex === 0}
          aria-label="Previous Scene"
          className="p-1.5 rounded-full text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--surface-soft)] disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2 my-1">
          {sections.map((sec, idx) => {
            const isCurrent = idx === activeIndex;
            const label = sec.publicDisplayTitle || sec.navLabel || sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => changeScene(idx)}
                aria-label={`Go to scene ${idx + 1}: ${label}`}
                title={`Scene ${idx + 1}: ${label}`}
                className="group relative flex items-center justify-center p-1 focus:outline-none"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "w-3 h-3 bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] scale-110"
                      : "w-2 h-2 bg-[var(--foreground)] opacity-40 hover:opacity-100 hover:scale-125"
                  }`}
                />
                {/* Floating Tooltip Label */}
                <span className="absolute right-7 px-2.5 py-1 rounded-md bg-[var(--surface)] text-[11px] font-mono font-medium text-[var(--foreground)] shadow-lg border border-[var(--border-thin)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  0{idx + 1}. {label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={goToNextScene}
          disabled={activeIndex === sections.length - 1}
          aria-label="Next Scene"
          className="p-1.5 rounded-full text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--surface-soft)] disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </nav>

      {/* Bottom Hint & Controls Indicator */}
      <div className="fixed bottom-4 left-6 z-30 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)]/70 border border-[var(--border-thin)] text-[11px] font-mono text-[var(--foreground)] opacity-60 backdrop-blur-sm">
        <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Use Wheel / Arrows / Touch to navigate scenes</span>
      </div>
    </div>
  );
}
