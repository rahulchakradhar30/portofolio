"use client";

import React, { useState, useEffect } from "react";
import { useMotionPreferences } from "../MotionProvider";

interface ImmersiveCameraProps {
  children: React.ReactNode;
}

export default function ImmersiveCamera({ children }: ImmersiveCameraProps) {
  const { reducedMotion } = useMotionPreferences();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#06070a] flex items-center justify-center select-none"
         style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}>
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
