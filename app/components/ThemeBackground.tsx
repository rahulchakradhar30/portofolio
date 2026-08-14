"use client";

import React from "react";
import PaperBackground from "./PaperBackground";
import SpatialBackground from "./spatial/SpatialBackground";
import { usePortfolioContent } from "./PortfolioContentProvider";
import { getActiveThemeMode } from "@/app/lib/themeResolver";

export default function ThemeBackground() {
  const { content } = usePortfolioContent();
  const themeMode = getActiveThemeMode(content?.themeConfig || content);

  if (themeMode === "spatial") {
    return <SpatialBackground />;
  }

  return <PaperBackground />;
}
