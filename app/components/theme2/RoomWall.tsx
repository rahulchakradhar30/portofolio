"use client";

import React from "react";

interface RoomWallProps {
  position: "front" | "left" | "right" | "back";
  isActive?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function RoomWall({
  position,
  isActive: _isActive = false,
  children,
  style,
  className = "",
}: RoomWallProps) {
  const isFront = position === "front";

  return (
    <div
      className={`absolute inset-0 rounded-3xl transition-all duration-700 ${
        isFront
          ? "bg-gradient-to-b from-[#131622] via-[#0f111a] to-[#0a0b10] border border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.9)]"
          : "bg-gradient-to-b from-[#0a0c12] via-[#08090e] to-[#050608] border border-white/5 opacity-40 blur-[0.5px]"
      } ${className}`}
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        ...style,
      }}
    >
      {/* Wall Texture / Brushed Metal Grain lines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 rounded-3xl overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "100% 24px"
        }}
      />

      {/* Front Active Wall Glowing Accent Borders */}
      {isFront && (
        <>
          <div className="absolute inset-0 rounded-3xl border border-[var(--accent)]/30 pointer-events-none shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80" />
        </>
      )}

      {/* Adjacent Dim Wall Architectural Seams */}
      {!isFront && (
        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
          <div className="w-full h-[1px] bg-white/10" />
          <div className="w-full h-[1px] bg-white/10" />
          <div className="w-full h-[1px] bg-white/10" />
        </div>
      )}

      {/* Content Mount */}
      <div className="relative w-full h-full z-10">
        {children}
      </div>
    </div>
  );
}
