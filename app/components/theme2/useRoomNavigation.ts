"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { HomepageSectionConfig } from "@/app/lib/types";

interface UseRoomNavigationProps {
  sections: HomepageSectionConfig[];
  transitionDurationMs?: number;
}

export function useRoomNavigation({
  sections,
  transitionDurationMs = 800,
}: UseRoomNavigationProps) {
  const [activeWallIndex, setActiveWallIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const wallCount = sections.length || 1;
  const isTransitioningRef = useRef(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const angleStep = 360 / wallCount;
  // Camera Y-rotation angle in degrees
  const cameraAngle = -activeWallIndex * angleStep;

  const triggerTransition = useCallback(
    (targetIndex: number) => {
      if (isTransitioningRef.current || wallCount <= 1) return;

      const normalizedIndex = (targetIndex + wallCount) % wallCount;
      if (normalizedIndex === activeWallIndex) return;

      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setActiveWallIndex(normalizedIndex);

      // Update URL Hash on settled section
      const targetSection = sections[normalizedIndex];
      if (targetSection && typeof window !== "undefined") {
        const newHash = `#${targetSection.id}`;
        if (window.location.hash !== newHash) {
          window.history.pushState(null, "", newHash);
        }
      }

      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      }, transitionDurationMs);
    },
    [activeWallIndex, wallCount, sections, transitionDurationMs]
  );

  const nextWall = useCallback(() => {
    triggerTransition(activeWallIndex + 1);
  }, [activeWallIndex, triggerTransition]);

  const prevWall = useCallback(() => {
    triggerTransition(activeWallIndex - 1);
  }, [activeWallIndex, triggerTransition]);

  const goToWall = useCallback(
    (index: number) => {
      triggerTransition(index);
    },
    [triggerTransition]
  );

  // Hash Navigation Sync (Direct Link & Browser Back/Forward)
  useEffect(() => {
    if (typeof window === "undefined" || sections.length === 0) return;

    const syncHashWithSection = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (!hash) return;

      const foundIndex = sections.findIndex(
        (sec) => sec.id.toLowerCase() === hash || sec.navLabel.toLowerCase() === hash
      );

      if (foundIndex !== -1 && foundIndex !== activeWallIndex) {
        setActiveWallIndex(foundIndex);
      }
    };

    syncHashWithSection();

    const handlePopState = () => {
      syncHashWithSection();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [sections, activeWallIndex]);

  // Keyboard Navigation (Left / Right Arrows, A / D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do NOT hijack input when user is typing in form controls
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        nextWall();
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        prevWall();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextWall, prevWall]);

  // Wheel / Trackpad Navigation
  useEffect(() => {
    let wheelAccumulator = 0;
    let wheelTimer: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      // Ignore if user is inside a scrollable modal/dropdown
      const target = e.target as HTMLElement | null;
      if (target?.closest?.(".scrollable-modal, [data-no-room-scroll]")) {
        return;
      }

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wheelAccumulator += delta;

      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelAccumulator = 0;
      }, 200);

      if (Math.abs(wheelAccumulator) > 40) {
        if (wheelAccumulator > 0) {
          nextWall();
        } else {
          prevWall();
        }
        wheelAccumulator = 0;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [nextWall, prevWall]);

  // Mobile Touch Swipe Navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const diffX = touchStartX - e.changedTouches[0].clientX;
        const diffY = touchStartY - e.changedTouches[0].clientY;

        // Check horizontal intent (swipe left/right)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0) {
            nextWall();
          } else {
            prevWall();
          }
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [nextWall, prevWall]);

  return {
    activeWallIndex,
    wallCount,
    cameraAngle,
    isTransitioning,
    nextWall,
    prevWall,
    goToWall,
  };
}
