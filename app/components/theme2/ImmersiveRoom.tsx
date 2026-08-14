"use client";

import React from "react";
import ImmersiveCamera from "./ImmersiveCamera";
import RoomWall from "./RoomWall";
import HeroWall from "./HeroWall";
import RoomLighting from "./RoomLighting";
import type { HomepageSectionConfig } from "@/app/lib/types";
import { Layers3, Sparkles } from "lucide-react";

interface ImmersiveRoomProps {
  sections: HomepageSectionConfig[];
  activeWallIndex: number;
  cameraAngle: number;
  isTransitioning: boolean;
}

export default function ImmersiveRoom({
  sections,
  activeWallIndex,
  cameraAngle,
  isTransitioning,
}: ImmersiveRoomProps) {
  const wallCount = sections.length || 1;
  const angleStep = 360 / wallCount;

  // Calculate 3D polygon radius from central camera
  const wallWidthPx = 1100;
  const calculatedRadius = Math.max(
    650,
    Math.round(wallWidthPx / (2 * Math.tan(Math.PI / Math.max(wallCount, 3))))
  );
  const wallRadius = Math.min(calculatedRadius, 1100);

  return (
    <ImmersiveCamera cameraAngle={cameraAngle} isTransitioning={isTransitioning}>
      {/* 3D Room Polygon Container */}
      <div 
        className="relative flex items-center justify-center w-[92vw] max-w-[1250px] h-[85vh] max-h-[780px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Dual Layer Room Lighting System */}
        <RoomLighting activeWallIndex={activeWallIndex} isTransitioning={isTransitioning} />

        {/* 3D Polygon Ring of Portfolio Walls */}
        {sections.map((section, idx) => {
          const wallAngle = idx * angleStep;
          const isActive = idx === activeWallIndex;
          const isHero = section.id === "hero";
          const sectionTitle = section.publicDisplayTitle || section.navLabel || section.id.toUpperCase();
          const sectionNumber = String(idx + 1).padStart(2, "0");

          return (
            <RoomWall
              key={section.id}
              position={isHero ? "front" : "back"}
              isActive={isActive}
              className={`transition-opacity duration-500 ${
                isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-30 blur-[0.5px]"
              }`}
              style={{
                transform: `rotateY(${wallAngle}deg) translateZ(-${wallRadius}px)`,
              }}
            >
              {isHero ? (
                <HeroWall />
              ) : (
                /* Architectural Wall Geometry for Future Sections (Phase 3 Connector) */
                <div className="relative w-full h-full p-8 md:p-14 flex flex-col justify-between overflow-hidden select-none">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-[var(--accent)]/10 pointer-events-none" />
                  
                  {/* Architectural Guideline Texture */}
                  <div 
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: "60px 60px"
                    }}
                  />

                  {/* Wall Header */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-[#0d0f17]/80 backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="text-xs font-mono font-bold tracking-widest text-white/90">
                        EXHIBIT {sectionNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs uppercase text-white/40 tracking-wider">
                      <Layers3 className="w-4 h-4 text-[var(--accent)]" />
                      SPATIAL WALL // {section.id.toUpperCase()}
                    </div>
                  </div>

                  {/* Wall Body */}
                  <div className="relative z-10 space-y-4 my-auto max-w-2xl text-left">
                    <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                      {sectionTitle}
                    </h2>
                    {section.subtitle && (
                      <p className="text-lg sm:text-xl font-medium text-white/80 leading-relaxed">
                        {section.subtitle}
                      </p>
                    )}
                    <div className="pt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/60">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                      SPATIAL NAVIGATION ACTIVE // CONNECTS IN PHASE 3
                    </div>
                  </div>

                  {/* Wall Footer */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/40 pt-4 border-t border-white/10">
                    <div>WALL {sectionNumber} OF {String(wallCount).padStart(2, "0")}</div>
                    <div>ANGLE: {Math.round(wallAngle)}°</div>
                  </div>
                </div>
              )}
            </RoomWall>
          );
        })}

        {/* Reflective Architectural Floor */}
        <div
          className="absolute -bottom-24 w-[160vw] h-[900px] pointer-events-none opacity-35"
          style={{
            transformOrigin: "center bottom",
            transform: `rotateX(90deg) translateZ(${wallRadius * 0.25}px)`,
            background: `
              radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%),
              linear-gradient(to bottom, #0d0f17 0%, #040508 100%)
            `,
          }}
        >
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
              `,
              backgroundSize: "90px 90px"
            }}
          />
        </div>

        {/* Ceiling Boundary Soffit */}
        <div
          className="absolute -top-24 w-[160vw] h-[600px] pointer-events-none opacity-25"
          style={{
            transformOrigin: "center top",
            transform: `rotateX(-90deg) translateZ(${wallRadius * 0.25}px)`,
            background: "linear-gradient(to bottom, #040508 0%, #0d0f17 100%)",
          }}
        />
      </div>
    </ImmersiveCamera>
  );
}
