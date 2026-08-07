"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ExpandableSectionProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  collapsedMaxHeightPx?: number;
  viewMoreLabel?: string;
  viewLessLabel?: string;
  onOverflowChange?: (hasOverflow: boolean) => void;
}

export default function ExpandableSection({
  children,
  className = "",
  contentClassName = "",
  collapsedMaxHeightPx = 760,
  viewMoreLabel = "View More",
  viewLessLabel = "Show Less",
  onOverflowChange,
}: ExpandableSectionProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const measure = () => {
      const element = contentRef.current;
      if (!element) return;
      const nextOverflow = element.scrollHeight > collapsedMaxHeightPx + 8;
      setHasOverflow(nextOverflow);
      if (!nextOverflow) {
        setExpanded(false);
      }
      onOverflowChange?.(nextOverflow);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    if (contentRef.current) observer.observe(contentRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [collapsedMaxHeightPx, onOverflowChange]);

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={contentRef}
          className={contentClassName}
          style={
            expanded || !hasOverflow 
              ? undefined 
              : { 
                  maxHeight: `${collapsedMaxHeightPx}px`, 
                  overflow: "hidden",
                  maskImage: "linear-gradient(to top, transparent, black 6rem)",
                  WebkitMaskImage: "linear-gradient(to top, transparent, black 6rem)",
                }
          }
        >
          {children}
        </div>
      </div>

      {hasOverflow ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExpanded((current) => !current)}
          className="paper-button mx-auto mt-5 inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold"
          aria-expanded={expanded}
        >
          {expanded ? viewLessLabel : viewMoreLabel}
        </motion.button>
      ) : null}
    </div>
  );
}
