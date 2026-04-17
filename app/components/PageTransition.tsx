"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMotionPreferences } from "./MotionProvider";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reducedMotion } = useMotionPreferences();

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.32, ease: "easeOut" }}
          className="relative"
        >
          {!reducedMotion ? (
            <motion.div
              initial={{ scaleX: 0, opacity: 0.85 }}
              animate={{ scaleX: 1, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="pointer-events-none fixed left-0 top-0 z-[95] h-1 w-full origin-left bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
            />
          ) : null}
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}