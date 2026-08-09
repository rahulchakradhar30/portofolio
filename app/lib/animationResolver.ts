import type { TargetAndTransition } from "framer-motion";
import type {
  UnifiedAnimationConfig,
  BaseAnimationParams,
  SupportedAnimationType,
  SupportedEasing,
  PortfolioContent,
} from "./types";

export const DEFAULT_GLOBAL_ANIMATION: BaseAnimationParams = {
  type: "slide",
  duration: 0.6,
  delay: 0.1,
  staggerStep: 0.1,
  easing: "easeOut",
  scrollEffect: true,
};

export const DEFAULT_UNIFIED_ANIMATION_CONFIG: UnifiedAnimationConfig = {
  enabled: true,
  global: DEFAULT_GLOBAL_ANIMATION,
  sections: {},
  components: {},
};

export interface ResolvedAnimationResult {
  params: BaseAnimationParams;
  inheritance: "component" | "section" | "global" | "default";
  enabled: boolean;
  variants: {
    initial: TargetAndTransition;
    animate?: TargetAndTransition;
    whileInView?: TargetAndTransition;
    transition: Record<string, unknown>;
    whileHover?: TargetAndTransition;
    whileTap?: TargetAndTransition;
    viewport?: Record<string, unknown>;
  };
}

export function normalizeAnimationConfig(
  input?: Partial<UnifiedAnimationConfig> | Partial<PortfolioContent> | null
): UnifiedAnimationConfig {
  if (!input) return DEFAULT_UNIFIED_ANIMATION_CONFIG;

  // Handle case where input is direct UnifiedAnimationConfig
  if ("global" in input && typeof input.global === "object") {
    const rawGlobal = input.global || {};
    return {
      enabled: input.enabled !== false,
      global: {
        type: rawGlobal.type || DEFAULT_GLOBAL_ANIMATION.type,
        duration: Math.max(0.05, Number(rawGlobal.duration ?? DEFAULT_GLOBAL_ANIMATION.duration)),
        delay: Math.max(0, Number(rawGlobal.delay ?? DEFAULT_GLOBAL_ANIMATION.delay)),
        staggerStep: Math.max(0, Number(rawGlobal.staggerStep ?? DEFAULT_GLOBAL_ANIMATION.staggerStep)),
        easing: rawGlobal.easing || DEFAULT_GLOBAL_ANIMATION.easing,
        scrollEffect: rawGlobal.scrollEffect !== false,
      },
      sections: input.sections || {},
      components: input.components || {},
    };
  }

  // Legacy PortfolioContent fallback mapping
  const content = input as Partial<PortfolioContent>;
  const legacySpeedMap: Record<string, number> = { slow: 0.9, normal: 0.6, fast: 0.3 };
  const legacyTypeMap: Record<string, SupportedAnimationType> = { fade: "fade", slide: "slide", zoom: "scale" };

  return {
    enabled: content.animationsEnabled !== false,
    global: {
      type: (content.animationType && legacyTypeMap[content.animationType]) || DEFAULT_GLOBAL_ANIMATION.type,
      duration: (content.animationSpeed && legacySpeedMap[content.animationSpeed]) || DEFAULT_GLOBAL_ANIMATION.duration,
      delay: Number(content.animationDelay ?? DEFAULT_GLOBAL_ANIMATION.delay),
      staggerStep: 0.1,
      easing: "easeOut",
      scrollEffect: content.scrollEffects !== false,
    },
    sections: {},
    components: {},
  };
}

export function getResolvedAnimation(
  rawConfig?: UnifiedAnimationConfig | Partial<PortfolioContent> | null,
  sectionId?: string,
  componentId?: string
): ResolvedAnimationResult {
  const config = normalizeAnimationConfig(rawConfig);

  if (!config.enabled) {
    return {
      params: { ...DEFAULT_GLOBAL_ANIMATION, duration: 0, delay: 0 },
      inheritance: "default",
      enabled: false,
      variants: {
        initial: { opacity: 1, y: 0, scale: 1, rotate: 0 },
        animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
        transition: { duration: 0 },
      },
    };
  }

  let inheritance: "component" | "section" | "global" | "default" = "global";
  let params: BaseAnimationParams = { ...config.global };
  let isSectionEnabled = true;

  if (sectionId && config.sections?.[sectionId]) {
    const sec = config.sections[sectionId];
    if (sec.enabled === false) {
      isSectionEnabled = false;
    }
    inheritance = "section";
    params = {
      type: sec.type || params.type,
      duration: sec.duration !== undefined ? sec.duration : params.duration,
      delay: sec.delay !== undefined ? sec.delay : params.delay,
      staggerStep: sec.staggerStep !== undefined ? sec.staggerStep : params.staggerStep,
      easing: sec.easing || params.easing,
      scrollEffect: sec.scrollEffect !== undefined ? sec.scrollEffect : params.scrollEffect,
    };
  }

  if (componentId && config.components?.[componentId]) {
    const comp = config.components[componentId];
    if (comp.enabled === false) {
      isSectionEnabled = false;
    }
    inheritance = "component";
    params = {
      type: comp.type || params.type,
      duration: comp.duration !== undefined ? comp.duration : params.duration,
      delay: comp.delay !== undefined ? comp.delay : params.delay,
      staggerStep: comp.staggerStep !== undefined ? comp.staggerStep : params.staggerStep,
      easing: comp.easing || params.easing,
      scrollEffect: comp.scrollEffect !== undefined ? comp.scrollEffect : params.scrollEffect,
    };
  }

  if (!isSectionEnabled) {
    return {
      params: { ...params, duration: 0, delay: 0 },
      inheritance,
      enabled: false,
      variants: {
        initial: { opacity: 1, y: 0, scale: 1, rotate: 0 },
        animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
        transition: { duration: 0 },
      },
    };
  }

  const variants = buildFramerVariants(params);

  return {
    params,
    inheritance,
    enabled: true,
    variants,
  };
}

function getEasingCurve(easing?: SupportedEasing): string | number[] {
  switch (easing) {
    case "easeInOut":
      return "easeInOut";
    case "linear":
      return "linear";
    case "anticipate":
      return [0.68, -0.55, 0.265, 1.55];
    case "easeOut":
    default:
      return "easeOut";
  }
}

function buildFramerVariants(params: BaseAnimationParams) {
  const ease = getEasingCurve(params.easing);
  const transition = {
    duration: params.duration,
    delay: params.delay,
    ease,
  };

  switch (params.type) {
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        whileInView: params.scrollEffect ? { opacity: 1 } : undefined,
        viewport: params.scrollEffect ? { once: true, margin: "0px 0px -50px 0px" } : undefined,
        transition,
      };

    case "scale":
      return {
        initial: { opacity: 0, scale: 0.92 },
        animate: { opacity: 1, scale: 1 },
        whileInView: params.scrollEffect ? { opacity: 1, scale: 1 } : undefined,
        viewport: params.scrollEffect ? { once: true, margin: "0px 0px -50px 0px" } : undefined,
        transition,
      };

    case "reveal":
      return {
        initial: { opacity: 0, y: 35 },
        animate: { opacity: 1, y: 0 },
        whileInView: params.scrollEffect ? { opacity: 1, y: 0 } : undefined,
        viewport: params.scrollEffect ? { once: true, margin: "0px 0px -50px 0px" } : undefined,
        transition,
      };

    case "stagger":
      return {
        initial: { opacity: 0, y: 20 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            staggerChildren: params.staggerStep || 0.1,
            delayChildren: params.delay || 0.1,
          },
        },
        whileInView: params.scrollEffect
          ? {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: params.staggerStep || 0.1,
                delayChildren: params.delay || 0.1,
              },
            }
          : undefined,
        viewport: params.scrollEffect ? { once: true, margin: "0px 0px -50px 0px" } : undefined,
        transition,
      };

    case "float":
      return {
        initial: { opacity: 0, y: 15 },
        animate: {
          opacity: 1,
          y: [0, -10, 0],
          transition: {
            opacity: { duration: params.duration, delay: params.delay, ease },
            y: { duration: Math.max(2, params.duration * 3), repeat: Infinity, ease: "easeInOut" },
          },
        },
        transition,
      };

    case "rotate":
      return {
        initial: { opacity: 0, rotate: -6, scale: 0.95 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
        whileInView: params.scrollEffect ? { opacity: 1, rotate: 0, scale: 1 } : undefined,
        viewport: params.scrollEffect ? { once: true, margin: "0px 0px -50px 0px" } : undefined,
        transition,
      };

    case "slide":
    default:
      return {
        initial: { opacity: 0, y: 25 },
        animate: { opacity: 1, y: 0 },
        whileInView: params.scrollEffect ? { opacity: 1, y: 0 } : undefined,
        viewport: params.scrollEffect ? { once: true, margin: "0px 0px -50px 0px" } : undefined,
        transition,
      };
  }
}
