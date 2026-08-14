"use client";

import React, { useMemo } from "react";
import SpatialHeader from "./SpatialHeader";
import SpatialFooter from "./SpatialFooter";
import ImmersiveRoom from "./ImmersiveRoom";
import SpatialErrorBoundary from "./SpatialErrorBoundary";
import { usePortfolioContent } from "../PortfolioContentProvider";
import { normalizeHomepageConfig } from "@/app/lib/homepageConfig";

export default function SpatialWebsiteView() {
  const { content } = usePortfolioContent();

  const homepageConfig = useMemo(() => {
    return normalizeHomepageConfig(content?.homepageConfig);
  }, [content?.homepageConfig]);

  const activeSections = useMemo(() => {
    return (homepageConfig.sections || [])
      .filter((sec) => sec.visible !== false)
      .sort((a, b) => a.order - b.order);
  }, [homepageConfig.sections]);

  const motionBlurEnabled = content?.motionBlurConfig?.enabled ?? false;

  return (
    <SpatialErrorBoundary activeSections={activeSections}>
      <div className="relative w-full h-[100dvh] overflow-hidden bg-[#050608] text-white select-none">
        <SpatialHeader />
        <ImmersiveRoom
          sections={activeSections}
          motionBlurEnabled={motionBlurEnabled}
        />
        <SpatialFooter />
      </div>
    </SpatialErrorBoundary>
  );
}
