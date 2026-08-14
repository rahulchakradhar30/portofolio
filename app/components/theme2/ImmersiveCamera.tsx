"use client";

import React, { useState, useEffect } from "react";
import { useMotionPreferences } from "../MotionProvider";
import { usePortfolioContent } from "../PortfolioContentProvider";
import { getResolvedMotionBlur } from "@/app/lib/motionBlurResolver";

interface ImmersiveCameraProps {
  children: React.ReactNode;
  cameraAngle?: number;
  isTransitioning?: boolean;
}

export default function ImmersiveCamera({
  children,
  cameraAngle = 0,
  isTransitioning = false,
}: ImmersiveCameraProps) {
  const { reducedMotion } = useMotionPreferences();
  const { content } = usePortfolioContent();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Resolve Motion Blur settings from Admin CMS
  const motionBlurRes = getResolvedMotionBlur(content?.motionBlurConfig || content);
  const blurEnabled = motionBlurRes.enabled && motionBlurRes.preset !== "off" && !reducedMotion;
  const blurPx = blurEnabled && isTransitioning ? Math.min(motionBlurRes.params.maxBlurPx, 3) : 0;

  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize mouse coordinates from -1 to 1
      const normalizedX = (e.clientX / innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / innerHeight) * 2 - 1;

      // Subtle eye-level camera pan (max 2.5 degrees)
      setTilt({
        x: -normalizedY * 2.5,
        y: normalizedX * 2.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reducedMotion]);

  const transitionDuration = reducedMotion ? 0.1 : 0.8;

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-[#06070a] flex items-center justify-center select-none"
      style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${cameraAngle + tilt.y}deg)`,
          transition: `transform ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1), filter ${transitionDuration}s ease-out`,
          filter: blurPx > 0 ? `blur(${blurPx}px)` : "blur(0px)",
          willChange: isTransitioning ? "transform, filter" : "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
