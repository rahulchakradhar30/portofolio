"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMotionPreferences } from "../MotionProvider";

export default function SpatialBackground() {
  const { scrollEffectsEnabled } = useMotionPreferences();

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[var(--background)] transition-colors duration-700 select-none">
      {/* Darkened Spatial Depth Overlay */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 75%)",
        }}
      />

      {/* 3D Perspective Plane Grid Lines */}
      <div className="absolute inset-0 opacity-[0.07] overflow-hidden pointer-events-none" style={{ perspective: "1000px" }}>
        <div 
          className="absolute inset-x-[-50%] -bottom-[50%] h-[150%] origin-bottom transition-transform duration-1000"
          style={{
            transform: "rotateX(72deg) translateY(0px)",
            backgroundImage: `
              linear-gradient(to right, var(--foreground) 1px, transparent 1px),
              linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Spatial Focal Light Orbs (Accent Glow) */}
      {scrollEffectsEnabled ? (
        <>
          {/* Main Primary Camera Focus Light */}
          <motion.div
            animate={{
              x: [0, 40, -30, 0],
              y: [0, -30, 40, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              willChange: "transform",
              background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            }}
            className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-[0.18]"
          />

          {/* Secondary Counter Depth Light */}
          <motion.div
            animate={{
              x: [0, -50, 30, 0],
              y: [0, 50, -20, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            style={{
              willChange: "transform",
              background: "radial-gradient(circle, var(--accent-strong, var(--accent)) 0%, transparent 70%)",
            }}
            className="absolute bottom-[5%] right-[10%] w-[45vw] h-[45vw] rounded-full blur-[160px] opacity-[0.12]"
          />
        </>
      ) : null}

      {/* Atmospheric Horizon Blur Line */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-px opacity-30"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
