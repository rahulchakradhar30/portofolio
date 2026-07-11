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
          style={expanded || !hasOverflow ? undefined : { maxHeight: `${collapsedMaxHeightPx}px`, overflow: "hidden" }}
        >
          {children}
        </div>

        {!expanded && hasOverflow ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f4eadb] via-[#f4eadb]/80 to-transparent" />
        ) : null}
      </div>

      {hasOverflow ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExpanded((current) => !current)}
          className="mx-auto mt-5 inline-flex items-center justify-center rounded-full border border-[#7a5f47]/12 bg-white px-6 py-2.5 text-sm font-semibold text-[#5f4a38] shadow-sm transition hover:border-[#8d6b4e]/30 hover:bg-[#f7efe4]"
          aria-expanded={expanded}
        >
          {expanded ? viewLessLabel : viewMoreLabel}
        </motion.button>
      ) : null}
    </div>
  );
}
