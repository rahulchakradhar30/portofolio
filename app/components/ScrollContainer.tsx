"use client";

import { useEffect, useState, useRef, ReactNode, UIEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentScrollConfig, ScrollDirection } from "@/app/lib/types";

interface ScrollContainerProps {
  config?: ComponentScrollConfig;
  children: ReactNode;
  verticalClassName?: string;
  horizontalItemClassName?: string;
  ariaLabel?: string;
}

const DEFAULT_CONFIG: ComponentScrollConfig = {
  desktop: "vertical",
  tablet: "vertical",
  mobile: "vertical",
};

export default function ScrollContainer({
  config = DEFAULT_CONFIG,
  children,
  verticalClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  horizontalItemClassName = "shrink-0 w-[280px] sm:w-[340px] md:w-[380px] snap-start",
  ariaLabel = "Content list",
}: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDirection, setActiveDirection] = useState<ScrollDirection>("vertical");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Synchronously compute active breakpoint scroll direction
  useEffect(() => {
    const updateDirection = () => {
      const width = window.innerWidth;
      let dir: ScrollDirection = "vertical";
      if (width < 640) {
        dir = config?.mobile || "vertical";
      } else if (width < 1024) {
        dir = config?.tablet || "vertical";
      } else {
        dir = config?.desktop || "vertical";
      }
      setActiveDirection(dir);
    };

    updateDirection();
    window.addEventListener("resize", updateDirection, { passive: true });
    return () => window.removeEventListener("resize", updateDirection);
  }, [config]);

  // Check scroll positions for gradient indicators and navigation buttons
  const checkScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    if (activeDirection === "horizontal") {
      checkScrollState();
    }
  }, [activeDirection, children]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (activeDirection === "vertical") {
    return <div className={verticalClassName}>{children}</div>;
  }

  return (
    <div className="relative group/scroll-container w-full">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          onClick={() => scrollByAmount("left")}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--foreground)] text-[var(--foreground)] shadow-[3px_3px_0_0_rgba(42,36,31,0.2)] hover:bg-[var(--surface-strong)] transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          onClick={() => scrollByAmount("right")}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--foreground)] text-[var(--foreground)] shadow-[3px_3px_0_0_rgba(42,36,31,0.2)] hover:bg-[var(--surface-strong)] transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Left Gradient Edge Overlay */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none z-10" />
      )}

      {/* Right Gradient Edge Overlay */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none z-10" />
      )}

      {/* Horizontal Scroll Track */}
      <div
        ref={containerRef}
        onScroll={(e: UIEvent<HTMLDivElement>) => checkScrollState()}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-1 scrollbar-thin touch-pan-x focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-xl"
      >
        {Array.isArray(children)
          ? children.map((child, idx) => (
              <div key={idx} className={horizontalItemClassName}>
                {child}
              </div>
            ))
          : <div className={horizontalItemClassName}>{children}</div>}
      </div>
    </div>
  );
}
