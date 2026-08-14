"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { HomepageSectionConfig } from "@/app/lib/types";
import ImmersiveWall from "./ImmersiveWall";
import RoomLighting from "./RoomLighting";
import RoomNavigation from "./RoomNavigation";
import AtmosphericParticles from "./AtmosphericParticles";
import { usePortfolioContent } from "../PortfolioContentProvider";
import { useMotionPreferences } from "../MotionProvider";
import { normalizeThemeConfig } from "@/app/lib/themeResolver";

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
  const { content } = usePortfolioContent();
  const { spatialRoomConfig } = useMemo(() => normalizeThemeConfig(content?.themeConfig || content), [content]);

  const { reducedMotion } = useMotionPreferences();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [roomEntering, setRoomEntering] = useState<boolean>(true);

  const isTransitioningRef = useRef<boolean>(false);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
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
    window.addEventListener("popstate", syncIndexFromHash);
    return () => {
      window.removeEventListener("hashchange", syncIndexFromHash);
      window.removeEventListener("popstate", syncIndexFromHash);
    };
  }, [syncIndexFromHash]);

  // Navigate to target wall with cooldown lock and browser history update
  const changeWall = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= sections.length) return;
      if (isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      setActiveIndex(newIndex);

      // Push browser history entry for meaningful section changes
      const targetSec = sections[newIndex];
      if (targetSec && typeof window !== "undefined") {
        const hash = `#${targetSec.id}`;
        if (window.location.hash !== hash) {
          window.history.pushState(null, "", hash);
        }
      }

      const cooldown = reducedMotion ? 300 : 650;
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

  // Keyboard navigation listener
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

      const key = e.key.toLowerCase();

      if (key === "arrowright" || key === "d" || key === "arrowdown" || key === "pagedown" || key === " ") {
        e.preventDefault();
        goToNextWall();
      } else if (key === "arrowleft" || key === "a" || key === "arrowup" || key === "pageup") {
        e.preventDefault();
        goToPrevWall();
      } else if (key === "home") {
        e.preventDefault();
        changeWall(0);
      } else if (key === "end") {
        e.preventDefault();
        changeWall(sections.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextWall, goToPrevWall, changeWall, sections.length]);

  // Mouse wheel listener with velocity thresholding
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
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

  // Touch swipe gesture listener
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;

      const SWIPE_THRESHOLD = 40;
      // Prioritize horizontal swipe or vertical swipe depending on magnitude
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > SWIPE_THRESHOLD) goToNextWall();
        else if (deltaX < -SWIPE_THRESHOLD) goToPrevWall();
      } else {
        if (deltaY > SWIPE_THRESHOLD) goToNextWall();
        else if (deltaY < -SWIPE_THRESHOLD) goToPrevWall();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goToNextWall, goToPrevWall]);

  // Mouse Drag / Look listener
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only trigger drag look on room background, not inside interactive buttons/cards
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest(".overflow-y-auto")) {
      return;
    }
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const deltaX = dragStartXRef.current - e.clientX;

    const DRAG_THRESHOLD = 50;
    if (deltaX > DRAG_THRESHOLD) goToNextWall();
    else if (deltaX < -DRAG_THRESHOLD) goToPrevWall();
  };

  // Compute dynamic cylindrical room geometry around visitor
  const total = Math.max(sections.length, 1);
  const wallAngleStep = 360 / total;

  // Dynamic radius based on wall count to maintain optimal perspective space
  const radius = useMemo(() => {
    return Math.max(650, Math.min(1050, Math.round(500 / Math.sin(Math.PI / Math.max(total, 4)))));
  }, [total]);

  // Camera rotation angle to focus active wall
  const cameraAngle = -activeIndex * wallAngleStep;

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative w-full h-[calc(100dvh-70px)] mt-[70px] overflow-hidden flex items-center justify-center select-none bg-[#050608]"
    >
      {/* Physical Room Spotlights */}
      <RoomLighting
        activeWallIndex={activeIndex}
        totalWalls={sections.length}
        spotlightIntensity={spatialRoomConfig?.spotlightIntensity}
        roomDarkness={spatialRoomConfig?.roomDarkness}
      />

      {/* Sparse Architectural Dust Motes */}
      {spatialRoomConfig?.enableParticles !== false && (
        <AtmosphericParticles activeWallIndex={activeIndex} />
      )}

      {/* Architectural Floor Grid Plane */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-x-[-50%] -bottom-[60%] h-[160%] origin-bottom transition-transform duration-1000"
          style={{
            transform: `rotateX(78deg) rotateZ(${-cameraAngle * 0.15}deg)`,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* 3D Exhibition Room Spatial Wall Ring Container */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0, scale: 0.9, z: -400 }}
          animate={{
            opacity: roomEntering ? 0 : 1,
            scale: roomEntering ? 0.9 : 1,
            rotateY: reducedMotion ? 0 : cameraAngle,
          }}
          transition={{
            duration: reducedMotion ? 0.3 : 0.75,
            ease: [0.25, 1, 0.35, 1],
          }}
        >
          {sections.map((section, idx) => {
            const isActive = idx === activeIndex;
            const distance = Math.abs(idx - activeIndex);
            const isAdjacent = distance === 1;
            const isDistant = distance > 1;

            // 3D positioning on cylindrical ring around camera center
            const wallRotationY = idx * wallAngleStep;
            const transform3D = reducedMotion
              ? `translate3d(0, 0, ${isActive ? "0px" : "-400px"})`
              : `rotateY(${wallRotationY}deg) translateZ(${radius}px)`;

            return (
              <ImmersiveWall
                key={section.id}
                section={section}
                wallIndex={idx}
                totalWalls={sections.length}
                isActive={isActive}
                isAdjacent={isAdjacent}
                isDistant={isDistant}
                transform3D={transform3D}
                spotlightIntensity={isActive ? (spatialRoomConfig?.spotlightIntensity ?? 1) : 0.2}
                onSelect={() => changeWall(idx)}
                reducedMotion={reducedMotion}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Spatial Navigation Rail & Compass Overlay */}
      {spatialRoomConfig?.showRoomNavigation !== false && (
        <RoomNavigation
          sections={sections}
          activeIndex={activeIndex}
          onSelectWall={changeWall}
          onNextWall={goToNextWall}
          onPrevWall={goToPrevWall}
        />
      )}
    </div>
  );
}
