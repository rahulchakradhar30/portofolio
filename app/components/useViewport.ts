"use client";

import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update, { passive: true });

    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return isMobile;
}