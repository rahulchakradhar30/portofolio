"use client";

import React from "react";

interface RoomLightingProps {
  activeWallIndex?: number;
  isTransitioning?: boolean;
}

export default function RoomLighting({
  activeWallIndex: _activeWallIndex = 0,
  isTransitioning = false,
}: RoomLightingProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* 1. Primary Spotlight Beam casting onto the Front Active Wall */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] mix-blend-screen transition-opacity duration-700"
        style={{
          opacity: isTransitioning ? 0.25 : 0.45,
          background: `
            radial-gradient(
              ellipse 70% 60% at 50% 25%,
              var(--accent, #d94e33) 0%,
              rgba(255, 255, 255, 0.08) 35%,
              transparent 70%
            )
          `
        }}
      />

      {/* 2. Top Ceiling Downlight Spotlight Mask */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 transition-opacity duration-700"
        style={{
          opacity: isTransitioning ? 0.15 : 0.35,
          background: `
            radial-gradient(
              ellipse at 50% 0%,
              rgba(255, 255, 255, 0.6) 0%,
              var(--accent, #d94e33) 40%,
              transparent 80%
            )
          `
        }}
      />

      {/* 3. Outer Room Ambient Shadow / Vignette (Dims Adjacent Left/Right/Back Walls & Edges) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 85% 75% at 50% 50%,
              transparent 45%,
              rgba(5, 6, 9, 0.6) 75%,
              rgba(3, 4, 6, 0.95) 100%
            )
          `
        }}
      />
    </div>
  );
}
