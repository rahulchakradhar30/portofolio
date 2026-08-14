"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMotionPreferences } from "../MotionProvider";

export default function SpatialBackground() {
  const { scrollEffectsEnabled } = useMotionPreferences();

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050608] transition-colors duration-700 select-none">
      {/* Dark Architectural Depth Radial Vignette */}
      <div 
        className="absolute inset-0 opacity-60 mix-blend-overlay pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.06) 0%, rgba(5,6,8,0.95) 80%)",
        }}
      />

      {/* Architectural Ceiling Horizon Accent Glow */}
      {scrollEffectsEnabled && (
        <motion.div
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            willChange: "transform, opacity",
            background: "radial-gradient(circle at 50% 10%, var(--accent) 0%, transparent 65%)",
          }}
          className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[70vw] h-[50vw] rounded-full blur-[140px] opacity-20"
        />
      )}

      {/* Atmospheric Horizon Light Line */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-px opacity-20"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
