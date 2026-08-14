"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useMotionPreferences } from "../MotionProvider";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function AtmosphericParticles({
  activeWallIndex,
}: {
  activeWallIndex: number;
}) {
  const { reducedMotion, scrollEffectsEnabled } = useMotionPreferences();

  // Generate sparse, slow-moving architectural dust motes
  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    const count = 18; // Keep count low for high performance
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        x: Math.round(((i * 23 + 13) % 90) + 5), // percentage
        y: Math.round(((i * 37 + 7) % 80) + 10), // percentage
        size: (i % 3) + 1.5, // px size
        duration: 12 + (i % 7) * 3, // seconds
        delay: (i % 5) * 1.2, // seconds
        opacity: 0.15 + (i % 4) * 0.08,
      });
    }
    return list;
  }, []);

  if (reducedMotion || !scrollEffectsEnabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
          }}
          animate={{
            y: ["0px", "-40px", "20px", "0px"],
            x: ["0px", "25px", "-15px", "0px"],
            opacity: [p.opacity * 0.5, p.opacity * 1.4, p.opacity * 0.6, p.opacity * 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
