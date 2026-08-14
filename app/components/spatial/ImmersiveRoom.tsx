"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { HomepageSectionConfig } from "@/app/lib/types";
import ImmersiveWall from "./ImmersiveWall";
import RoomLighting from "./RoomLighting";
import RoomNavigation from "./RoomNavigation";
import { useMotionPreferences } from "../MotionProvider";

interface ImmersiveRoomProps {
  sections: HomepageSectionConfig[];
  motionBlurEnabled?: boolean;
  isIntroPlaying?: boolean;
}

export default function ImmersiveRoom({
  sections,
  motionBlurEnabled = false,
  isIntroPlaying = false,
}: ImmersiveRoomProps) {
  const { reducedMotion } = useMotionPreferences();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [roomEntering, setRoomEntering] = useState<boolean>(true);

  const isTransitioningRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const wheelDeltaAccumulator = useRef<number>(0);

  // Trigger room entrance transition after initial load or intro completion
  useEffect(() => {
    if (!isIntroPlaying) {
      const timer = setTimeout(() => {
        setRoomEntering(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isIntroPlaying]);

  // Synchronize location hash with wall index
  const syncIndexFromHash = useCallback(() => {
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
    queueMicrotask(() => syncIndexFromHash());
    window.addEventListener("hashchange", syncIndexFromHash);
    return () => window.removeEventListener("hashchange", syncIndexFromHash);
  }, [syncIndexFromHash]);

  // Navigate to target wall with cooldown lock
  const changeWall = useCallback(
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

      const cooldown = reducedMotion ? 300 : 600;
      setTimeout(() => {
        isTransitioningRef.current = false;
        wheelDeltaAccumulator.current = 0;
      }, cooldown);
    },
    [sections, reducedMotion]
  );

  const goToNextWall = useCallback(() => {
    if (activeIndex < sections.length - 1) {
      changeWall(activeIndex + 1);
    }
  }, [activeIndex, sections.length, changeWall]);

  const goToPrevWall = useCallback(() => {
    if (activeIndex > 0) {
      changeWall(activeIndex - 1);
    }
  }, [activeIndex, changeWall]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goToNextWall();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToPrevWall();
      } else if (e.key === "Home") {
        e.preventDefault();
        changeWall(0);
      } else if (e.key === "End") {
        e.preventDefault();
        changeWall(sections.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextWall, goToPrevWall, changeWall, sections.length]);

  // Wheel scroll with velocity threshold
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if user is scrolling inside a wall content card with scrollable text
      const scrollable = (e.target as HTMLElement | null)?.closest(".overflow-y-auto");
      if (scrollable) {
        const { scrollTop, scrollHeight, clientHeight } = scrollable;
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;

        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 4;
        const isAtTop = scrollTop < 4;

        if (isScrollingDown && !isAtBottom) return;
        if (isScrollingUp && !isAtTop) return;
      }

      e.preventDefault();
      wheelDeltaAccumulator.current += e.deltaY;

      const THRESHOLD = 45;
      if (wheelDeltaAccumulator.current > THRESHOLD) {
        goToNextWall();
        wheelDeltaAccumulator.current = 0;
      } else if (wheelDeltaAccumulator.current < -THRESHOLD) {
        goToPrevWall();
        wheelDeltaAccumulator.current = 0;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goToNextWall, goToPrevWall]);

  // Touch swipe listener
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartYRef.current - touchEndY;

      const SWIPE_THRESHOLD = 40;
      if (deltaY > SWIPE_THRESHOLD) {
        goToNextWall();
      } else if (deltaY < -SWIPE_THRESHOLD) {
        goToPrevWall();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goToNextWall, goToPrevWall]);

  // Compute 3D Spatial Layout positioning for each wall around the room
  const wallTransforms = useMemo(() => {
    const total = sections.length;
    const radius = 800; // 3D distance radius from center visitor viewpoint

    return sections.map((_, idx) => {
      const offset = idx - activeIndex;
      const angleStep = Math.min(45, 360 / Math.max(total, 4));
      const rotationY = offset * angleStep;

      // Calculate 3D spatial transforms
      if (reducedMotion) {
        return `translate3d(0, 0, ${offset === 0 ? "0px" : "-400px"})`;
      }

      const translateZ = offset === 0 ? 0 : -Math.abs(offset) * 320;
      const translateX = offset * 260;

      return `translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotationY}deg)`;
    });
  }, [sections, activeIndex, reducedMotion]);

  return (
    <div className="relative w-full h-[calc(100dvh-70px)] mt-[70px] overflow-hidden flex items-center justify-center select-none bg-[#050608]">
      {/* Dynamic Physical Room Spotlights */}
      <RoomLighting
        activeWallIndex={activeIndex}
        totalWalls={sections.length}
      />

      {/* Architectural Dark Floor Grid Plane */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{ perspective: "1000px" }}
      >
        <div
          className="absolute inset-x-[-50%] -bottom-[60%] h-[160%] origin-bottom transition-transform duration-1000"
          style={{
            transform: "rotateX(78deg)",
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* 3D Exhibition Room Spatial Wall Ring Container */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
        initial={{ opacity: 0, scale: 0.9, z: -400 }}
        animate={{
          opacity: roomEntering ? 0 : 1,
          scale: roomEntering ? 0.9 : 1,
          z: roomEntering ? -400 : 0,
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {sections.map((section, idx) => {
          const isActive = idx === activeIndex;
          const isAdjacent = Math.abs(idx - activeIndex) <= 1;

          return (
            <ImmersiveWall
              key={section.id}
              section={section}
              wallIndex={idx}
              totalWalls={sections.length}
              isActive={isActive}
              isAdjacent={isAdjacent}
              transform3D={wallTransforms[idx]}
              spotlightIntensity={isActive ? 1 : 0.2}
              onSelect={() => changeWall(idx)}
              reducedMotion={reducedMotion}
            />
          );
        })}
      </motion.div>

      {/* Spatial Navigation Rail & Compass Overlay */}
      <RoomNavigation
        sections={sections}
        activeIndex={activeIndex}
        onSelectWall={changeWall}
        onNextWall={goToNextWall}
        onPrevWall={goToPrevWall}
      />
    </div>
  );
}
