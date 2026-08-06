"use client";

import { motion } from "framer-motion";

export default function PaperBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[var(--background)]">
      {/* Soft Vignette / Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8)_0%,transparent_100%)] opacity-50" />
      
      {/* Dotted Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(circle, #2a241f 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />
      
      {/* Paper Grain Noise */}
      <div className="absolute inset-0 opacity-[0.3] mix-blend-multiply">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" opacity="0.4" />
        </svg>
      </div>

      {/* Abstract Floating Shapes (Subtle Depth) */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 2, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-[#f0e9dd] opacity-30 blur-[100px]"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          rotate: [0, -3, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#f7f3ea] opacity-40 blur-[120px]"
      />
    </div>
  );
}
