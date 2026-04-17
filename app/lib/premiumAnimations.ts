/**
 * Premium Animation Utilities
 * Provides reusable animation patterns for OTT-style premium feel
 */

export const ANIMATION_PRESETS = {
  // Fade and slide animations
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },

  fadeInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },

  fadeInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" },
  },

  scaleInSmall: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },

  // Rotation animations
  rotateIn: {
    initial: { opacity: 0, rotate: -10, scale: 0.95 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" },
  },

  // Stagger container (use with children animation)
  staggerContainer: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  // Hover effects
  hoverLift: {
    whileHover: { y: -8, transition: { duration: 0.3 } },
    whileTap: { y: -4 },
  },

  hoverGlow: {
    whileHover: {
      boxShadow: "0 20px 60px rgba(168, 85, 247, 0.3)",
      transition: { duration: 0.3 },
    },
  },

  hoverScale: {
    whileHover: { scale: 1.05, transition: { duration: 0.3 } },
    whileTap: { scale: 0.98 },
  },

  // Continuous animations
  float: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  pulse: {
    animate: {
      opacity: [1, 0.7, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  shimmer: {
    animate: {
      backgroundPosition: ["0% 0%", "100% 0%"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  // Scroll animations
  reveal: {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
    viewport: { once: true, margin: "0px 0px -100px 0px" },
  },

  revealStagger: {
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "0px 0px -100px 0px" },
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.12,
          delayChildren: 0.1,
        },
      },
    },
  },

  revealItem: {
    variants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    },
  },
};

// Gradient presets for premium feel
export const PREMIUM_GRADIENTS = {
  // Hero gradients
  heroBackdrop: "bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.18)_0%,transparent_35%),radial-gradient(circle_at_85%_20%,rgba(251,191,36,0.14)_0%,transparent_32%),linear-gradient(140deg,#07101a_5%,#0b1c2c_52%,#07101a_100%)]",

  // Card gradients
  cardHover:
    "hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-pink-500/10 transition-all",

  // Text gradients
  textGradient:
    "bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent",

  ctaGradient:
    "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700",

  // Border gradients
  borderGradient:
    "border-transparent bg-gradient-to-r from-violet-200 to-pink-200 p-[1px]",
};

// Premium shadow presets
export const PREMIUM_SHADOWS = {
  sm: "shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
  md: "shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
  lg: "shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
  xl: "shadow-[0_12px_32px_rgba(0,0,0,0.2)]",
  glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
  glowPink: "shadow-[0_0_30px_rgba(236,72,153,0.3)]",
};

// Stagger delays
export function getStaggerDelay(index: number, baseDelay = 0.05): number {
  return index * baseDelay;
}

// Scroll-triggered animation helper
export const scrollRevealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.1,
      ease: "easeOut",
    },
  }),
};

// Complex entrance animation
export const complexEntrance = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  },
};

// Parallax scroll effect helper
export function useParallaxScroll(offset = 0.5) {
  if (typeof window === "undefined") return 0;

  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
  return scrollY * offset;
}

// Text reveal animation
export const textRevealVariants = {
  hidden: { opacity: 0, letterSpacing: "0.25em" },
  visible: (custom: number = 0) => ({
    opacity: 1,
    letterSpacing: "0em",
    transition: {
      duration: 1.4,
      delay: custom * 0.05,
      ease: "easeOut",
    },
  }),
};

// Color transition helper
export const colorTransition = {
  duration: 0.6,
  ease: "easeInOut",
};
