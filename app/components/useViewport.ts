"use client";

import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  // Compute the initial value synchronously so there is no flash of incorrect state.
  // The useState initializer already does this — the useEffect no longer needs to
  // call update() a second time immediately on mount.
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    // No need to call update() here — the useState initializer already captured
    // the correct value synchronously before the first paint.
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return isMobile;
}