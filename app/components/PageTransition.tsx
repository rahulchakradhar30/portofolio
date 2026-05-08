"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMotionPreferences } from "./MotionProvider";
import { useIsMobile } from "./useViewport";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reducedMotion } = useMotionPreferences();
  const isMobile = useIsMobile();
  const enterY = isMobile ? 8 : 14;
  const exitY = isMobile ? -6 : -10;
  const transition: Transition = reducedMotion
    ? { duration: 0.05 }
    : { type: "spring" as const, stiffness: isMobile ? 220 : 180, damping: isMobile ? 26 : 22, mass: 0.85 };

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: enterY }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: exitY }}
          transition={transition}
          className="relative"
        >
          {!reducedMotion ? (
            <motion.div
              initial={{ scaleX: 0, opacity: 0.85 }}
              animate={{ scaleX: 1, opacity: 0 }}
              transition={{ duration: isMobile ? 0.3 : 0.45, ease: "easeOut" }}
              className="pointer-events-none fixed left-0 top-0 z-[95] h-1 w-full origin-left bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
            />
          ) : null}
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}