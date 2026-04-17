"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function ImageLightbox({
  images,
  open,
  initialIndex,
  onClose,
}: {
  images: string[];
  open: boolean;
  initialIndex?: number;
  onClose: () => void;
}) {
  const safeImages = images.filter(Boolean);
  const [index, setIndex] = useState(initialIndex || 0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && safeImages.length > 1) {
        setIndex((prev) => (prev + 1) % safeImages.length);
        setZoom(1);
      }
      if (event.key === "ArrowLeft" && safeImages.length > 1) {
        setIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
        setZoom(1);
      }
      if (event.key === "+" || event.key === "=") {
        setZoom((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
      }
      if (event.key === "-") {
        setZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, safeImages.length]);

  if (!open || safeImages.length === 0) {
    return null;
  }

  const currentImage = safeImages[index] || safeImages[0];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] bg-black/90 p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute right-3 top-3 z-20 flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-end gap-2 sm:right-4 sm:top-4">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))));
            }}
            className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
            title="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setZoom(1);
            }}
            className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
            title="Reset zoom"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
            }}
            className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
            title="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 sm:left-4"
              onClick={(event) => {
                event.stopPropagation();
                setIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
                setZoom(1);
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 sm:right-4"
              onClick={(event) => {
                event.stopPropagation();
                setIndex((prev) => (prev + 1) % safeImages.length);
                setZoom(1);
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}

        <div
          className="relative flex h-full w-full items-center justify-center overflow-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <motion.div
            key={`${currentImage}-${index}`}
            initial={{ opacity: 0.4, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative h-[72vh] w-full max-w-[95vw] sm:h-[82vh]"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          >
            <Image
              src={currentImage}
              alt={`Preview ${index + 1}`}
              fill
              className="object-contain"
              sizes="95vw"
              priority
            />
          </motion.div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
          {index + 1}/{safeImages.length} | Zoom {Math.round(zoom * 100)}%
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
