"use client";

import React from "react";
import ImmersiveCamera from "./ImmersiveCamera";
import RoomWall from "./RoomWall";
import RoomLighting from "./RoomLighting";
import Theme2SectionAdapter from "./Theme2SectionAdapter";
import type { HomepageSectionConfig } from "@/app/lib/types";

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

        {/* 3D Polygon Ring of Portfolio Wall Exhibits */}
        {sections.map((section, idx) => {
          const wallAngle = idx * angleStep;
          const isActive = idx === activeWallIndex;
          const isFront = idx === 0;

          return (
            <RoomWall
              key={section.id}
              position={isFront ? "front" : "back"}
              isActive={isActive}
              className={`transition-opacity duration-500 ${
                isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-30 blur-[0.5px]"
              }`}
              style={{
                transform: `rotateY(${wallAngle}deg) translateZ(-${wallRadius}px)`,
              }}
            >
              <Theme2SectionAdapter section={section} isActive={isActive} />
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
