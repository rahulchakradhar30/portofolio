"use client";

import React, { useMemo } from "react";
import ImmersiveRoom from "./ImmersiveRoom";
import RoomHUD from "./RoomHUD";
import { useRoomNavigation } from "./useRoomNavigation";
import type { HomepageSectionConfig } from "@/app/lib/types";

interface Theme2RendererProps {
  initialSections?: HomepageSectionConfig[];
}

export default function Theme2Renderer({ initialSections = [] }: Theme2RendererProps) {
  const sections = useMemo(() => {
    if (initialSections && initialSections.length > 0) {
      return initialSections.filter((sec) => sec.visible !== false);
    }
    return [
      { id: "hero", type: "hero", internalName: "Hero", publicDisplayTitle: "Hero", visible: true, order: 0, navLabel: "Hero", visibleInNav: true, isBuiltIn: true, blocks: [] },
      { id: "about", type: "about", internalName: "About", publicDisplayTitle: "About Me", visible: true, order: 1, navLabel: "About", visibleInNav: true, isBuiltIn: true, blocks: [] },
      { id: "skills", type: "skills", internalName: "Skills", publicDisplayTitle: "Skills & Expertise", visible: true, order: 2, navLabel: "Skills", visibleInNav: true, isBuiltIn: true, blocks: [] },
      { id: "projects", type: "projects", internalName: "Projects", publicDisplayTitle: "Featured Projects", visible: true, order: 3, navLabel: "Projects", visibleInNav: true, isBuiltIn: true, blocks: [] },
      { id: "contact", type: "contact", internalName: "Contact", publicDisplayTitle: "Contact", visible: true, order: 4, navLabel: "Contact", visibleInNav: true, isBuiltIn: true, blocks: [] },
    ] as HomepageSectionConfig[];
  }, [initialSections]);

  const {
    activeWallIndex,
    cameraAngle,
    isTransitioning,
    nextWall,
    prevWall,
    goToWall,
  } = useRoomNavigation({ sections });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050608] text-white select-none">
      {/* 3D Immersive Spatial Room */}
      <ImmersiveRoom
        sections={sections}
        activeWallIndex={activeWallIndex}
        cameraAngle={cameraAngle}
        isTransitioning={isTransitioning}
      />

      {/* Minimal Theme 2 HUD Overlay & Navigation Indicator */}
      <RoomHUD
        sections={sections}
        activeWallIndex={activeWallIndex}
        isTransitioning={isTransitioning}
        onNext={nextWall}
        onPrev={prevWall}
        onSelectWall={goToWall}
      />
    </div>
  );
}
