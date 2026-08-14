"use client";

import React from "react";
import ImmersiveCamera from "./ImmersiveCamera";
import RoomWall from "./RoomWall";
import HeroWall from "./HeroWall";
import RoomLighting from "./RoomLighting";

export default function ImmersiveRoom() {
  return (
    <ImmersiveCamera>
      {/* 3D Room Box Container */}
      <div 
        className="relative flex items-center justify-center w-[92vw] max-w-[1300px] h-[85vh] max-h-[800px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Dual Layer Room Lighting System */}
        <RoomLighting />

        {/* 1. FRONT WALL (Illuminated Active Stage Mounting Hero Content) */}
        <RoomWall 
          position="front" 
          isActive={true}
          style={{ transform: "translateZ(-400px)" }}
        >
          <HeroWall />
        </RoomWall>

        {/* 2. LEFT WALL (Dark Architectural Panel) */}
        <RoomWall
          position="left"
          isActive={false}
          className="hidden md:block"
          style={{
            width: "700px",
            left: "-350px",
            transformOrigin: "left center",
            transform: "rotateY(90deg) translateZ(-200px)",
          }}
        />

        {/* 3. RIGHT WALL (Dark Architectural Panel) */}
        <RoomWall
          position="right"
          isActive={false}
          className="hidden md:block"
          style={{
            width: "700px",
            right: "-350px",
            transformOrigin: "right center",
            transform: "rotateY(-90deg) translateZ(-200px)",
          }}
        />

        {/* 4. BACK WALL (Encloses Room Behind Camera) */}
        <RoomWall
          position="back"
          isActive={false}
          style={{
            transform: "rotateY(180deg) translateZ(400px)",
          }}
        />

        {/* 5. ARCHITECTURAL FLOOR (Reflective Dark Floor Texture) */}
        <div
          className="absolute -bottom-20 w-[140vw] h-[700px] pointer-events-none opacity-40"
          style={{
            transformOrigin: "center bottom",
            transform: "rotateX(90deg) translateZ(100px)",
            background: `
              radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%),
              linear-gradient(to bottom, #0d0f17 0%, #040508 100%)
            `,
          }}
        >
          {/* Floor Reflection / Metallic Architectural Grid */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px"
            }}
          />
        </div>

        {/* 6. CEILING BOUNDARY / SOFFIT BEAM */}
        <div
          className="absolute -top-20 w-[140vw] h-[500px] pointer-events-none opacity-30"
          style={{
            transformOrigin: "center top",
            transform: "rotateX(-90deg) translateZ(100px)",
            background: "linear-gradient(to bottom, #040508 0%, #0d0f17 100%)",
          }}
        />
      </div>
    </ImmersiveCamera>
  );
}
