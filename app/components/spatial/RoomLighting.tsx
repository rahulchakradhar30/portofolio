"use client";

import React from "react";
import { motion } from "framer-motion";

interface RoomLightingProps {
  activeWallIndex: number;
  totalWalls: number;
  scrollEffectsEnabled?: boolean;
  spotlightIntensity?: number;
  roomDarkness?: number;
}

export default function RoomLighting({
  activeWallIndex,
  totalWalls,
  scrollEffectsEnabled = true,
  spotlightIntensity = 1.0,
  roomDarkness = 0.8,
}: RoomLightingProps) {
  // Compute spotlight rotation angle pointing to active wall
  const wallAngleStep = 360 / Math.max(totalWalls, 1);
  const currentAngle = activeWallIndex * wallAngleStep;

  const spotlightOpacityBase = 0.45 * Math.max(0.1, spotlightIntensity);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Primary Overhead Ceiling-Mounted Architectural Spotlight Beam */}
      <motion.div
        key={`spotlight-${activeWallIndex}`}
        initial={{ opacity: spotlightOpacityBase * 0.7, scale: 0.95 }}
        animate={{
          opacity: [spotlightOpacityBase, spotlightOpacityBase * 1.3, spotlightOpacityBase],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[75vw] h-[60vh] origin-top blur-[95px]"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, var(--accent) 0%, rgba(255,255,255,0.06) 45%, transparent 80%)`,
          transform: `translateX(-50%) rotate(${Math.sin((currentAngle * Math.PI) / 180) * 10}deg)`,
          transition: "transform 0.8s cubic-bezier(0.25, 1, 0.35, 1)",
        }}
      />

      {/* Indirect Low-Key Room Fill Light */}
      <div 
        className="absolute inset-0 mix-blend-screen"
        style={{
          opacity: Math.max(0.2, Math.min(1.0, roomDarkness)),
          background: `radial-gradient(circle at 50% 50%, rgba(15, 20, 28, 0.85) 0%, rgba(4, 5, 7, 0.98) 85%)`,
        }}
      />

      {/* Theme Accent Floor Reflections */}
      {scrollEffectsEnabled && (
        <motion.div
          animate={{
            x: ["-8%", "8%", "-8%"],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[85vw] h-[40vh] rounded-full blur-[150px] opacity-20"
          style={{
            background: `radial-gradient(circle, var(--accent) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Atmospheric Horizon Light Beam */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-px opacity-20"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
