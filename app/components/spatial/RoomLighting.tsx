"use client";

import React from "react";
import { motion } from "framer-motion";

interface RoomLightingProps {
  activeWallIndex: number;
  totalWalls: number;
  scrollEffectsEnabled?: boolean;
}

export default function RoomLighting({
  activeWallIndex,
  totalWalls,
  scrollEffectsEnabled = true,
}: RoomLightingProps) {
  // Compute spotlight angle based on active wall
  const angle = (activeWallIndex / Math.max(totalWalls, 1)) * 360;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Primary Overhead Architectural Spotlight Beam */}
      <motion.div
        animate={{
          opacity: [0.35, 0.45, 0.35],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[55vh] origin-top blur-[90px] opacity-40"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, var(--accent) 0%, rgba(255,255,255,0.05) 50%, transparent 80%)`,
          transform: `translateX(-50%) rotate(${Math.sin((angle * Math.PI) / 180) * 8}deg)`,
        }}
      />

      {/* Low-Key Ambient Dark Room Fill Light */}
      <div 
        className="absolute inset-0 opacity-60 mix-blend-screen"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(20, 25, 35, 0.8) 0%, rgba(5, 6, 8, 0.95) 80%)`,
        }}
      />

      {/* Theme Accent Floor Reflections */}
      {scrollEffectsEnabled && (
        <motion.div
          animate={{
            x: ["-10%", "10%", "-10%"],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[90vw] h-[40vh] rounded-full blur-[140px] opacity-20"
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
