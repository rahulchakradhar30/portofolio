"use client";

import React from "react";
import ImmersiveRoom from "./ImmersiveRoom";
import type { HomepageSectionConfig } from "@/app/lib/types";

interface Theme2RendererProps {
  initialSections?: HomepageSectionConfig[];
}

export default function Theme2Renderer({ initialSections: _initialSections }: Theme2RendererProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050608] text-white">
      {/* 3D Immersive Architectural Room */}
      <ImmersiveRoom />
    </div>
  );
}
