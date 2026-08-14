import type {
  MotionBlurParams,
  MotionBlurPreset,
  MotionBlurTokens,
  MotionBlurOverride,
  PortfolioContent,
  UnifiedMotionBlurConfig,
} from "./types";

export const MOTION_BLUR_PRESETS: Record<Exclude<MotionBlurPreset, "custom">, MotionBlurParams> = {
  off: {
    intensity: 0,
    maxBlurPx: 0,
    transitionDurationMs: 0,
    decaySpeed: 1.0,
  },
  subtle: {
    intensity: 0.4,
    maxBlurPx: 4,
    transitionDurationMs: 250,
    decaySpeed: 0.85,
  },
  cinematic: {
    intensity: 0.8,
    maxBlurPx: 10,
    transitionDurationMs: 450,
    decaySpeed: 0.6,
  },
};

export const DEFAULT_UNIFIED_MOTION_BLUR_CONFIG: UnifiedMotionBlurConfig = {
  enabled: false,
  preset: "subtle",
  global: MOTION_BLUR_PRESETS.subtle,
  sections: {},
  components: {},
};

export function normalizeMotionBlurConfig(
  input?: Partial<UnifiedMotionBlurConfig> | Partial<PortfolioContent> | null
): UnifiedMotionBlurConfig {
  if (!input) return DEFAULT_UNIFIED_MOTION_BLUR_CONFIG;

  const rawConfig = "motionBlurConfig" in input ? input.motionBlurConfig : (input as Partial<UnifiedMotionBlurConfig>);
  if (!rawConfig || typeof rawConfig !== "object") return DEFAULT_UNIFIED_MOTION_BLUR_CONFIG;

  const preset: MotionBlurPreset =
    rawConfig.preset && ["off", "subtle", "cinematic", "custom"].includes(rawConfig.preset)
      ? rawConfig.preset
      : DEFAULT_UNIFIED_MOTION_BLUR_CONFIG.preset;

  const defaultParams = preset !== "custom" && preset in MOTION_BLUR_PRESETS 
    ? MOTION_BLUR_PRESETS[preset as Exclude<MotionBlurPreset, "custom">] 
    : MOTION_BLUR_PRESETS.subtle;

  const rawGlobal: Partial<MotionBlurParams> = rawConfig.global || {};

  const globalParams: MotionBlurParams = {
    intensity: clampNumber(rawGlobal.intensity ?? defaultParams.intensity, 0.05, 1.0),
    maxBlurPx: Math.round(clampNumber(rawGlobal.maxBlurPx ?? defaultParams.maxBlurPx, 1, 20)),
    transitionDurationMs: Math.round(clampNumber(rawGlobal.transitionDurationMs ?? defaultParams.transitionDurationMs, 100, 1000)),
    decaySpeed: clampNumber(rawGlobal.decaySpeed ?? defaultParams.decaySpeed, 0.1, 1.0),
  };

  return {
    enabled: Boolean(rawConfig.enabled),
    preset,
    global: globalParams,
    sections: rawConfig.sections && typeof rawConfig.sections === "object" ? rawConfig.sections : {},
    components: rawConfig.components && typeof rawConfig.components === "object" ? rawConfig.components : {},
  };
}

export interface ResolvedMotionBlurResult {
  enabled: boolean;
  preset: MotionBlurPreset;
  params: MotionBlurParams;
  inheritance: "component" | "section" | "global" | "default";
}

export function getResolvedMotionBlur(
  rawConfig?: UnifiedMotionBlurConfig | Partial<PortfolioContent> | null,
  sectionId?: string,
  componentId?: string
): ResolvedMotionBlurResult {
  const normConfig = normalizeMotionBlurConfig(rawConfig);

  if (!normConfig.enabled) {
    return {
      enabled: false,
      preset: "off",
      params: MOTION_BLUR_PRESETS.off,
      inheritance: "default",
    };
  }

  let inheritance: "component" | "section" | "global" | "default" = "global";
  let params: MotionBlurParams = { ...normConfig.global };
  let preset: MotionBlurPreset = normConfig.preset;
  let isEnabled = true;

  if (sectionId && normConfig.sections?.[sectionId]) {
    const sec: MotionBlurOverride = normConfig.sections[sectionId];
    if (sec.enabled === false) {
      isEnabled = false;
    }
    inheritance = "section";
    if (sec.preset) preset = sec.preset;
    params = {
      ...params,
      intensity: sec.intensity !== undefined ? sec.intensity : params.intensity,
      maxBlurPx: sec.maxBlurPx !== undefined ? sec.maxBlurPx : params.maxBlurPx,
    };
  }

  if (componentId && normConfig.components?.[componentId]) {
    const comp: MotionBlurOverride = normConfig.components[componentId];
    if (comp.enabled === false) {
      isEnabled = false;
    }
    inheritance = "component";
    if (comp.preset) preset = comp.preset;
    params = {
      ...params,
      intensity: comp.intensity !== undefined ? comp.intensity : params.intensity,
      maxBlurPx: comp.maxBlurPx !== undefined ? comp.maxBlurPx : params.maxBlurPx,
    };
  }

  if (!isEnabled || preset === "off") {
    return {
      enabled: false,
      preset: "off",
      params: MOTION_BLUR_PRESETS.off,
      inheritance,
    };
  }

  return {
    enabled: true,
    preset,
    params,
    inheritance,
  };
}

export function resolveMotionBlurTokens(
  rawConfig?: UnifiedMotionBlurConfig | Partial<PortfolioContent> | null
): MotionBlurTokens {
  const normConfig = normalizeMotionBlurConfig(rawConfig);
  const { enabled, preset, global } = normConfig;

  if (!enabled || preset === "off") {
    return {
      motionBlurEnabled: "0",
      motionBlurPreset: "off",
      motionBlurRadius: "0px",
      motionBlurDuration: "0ms",
      motionBlurIntensity: "0",
    };
  }

  return {
    motionBlurEnabled: "1",
    motionBlurPreset: preset,
    motionBlurRadius: `${global.maxBlurPx}px`,
    motionBlurDuration: `${global.transitionDurationMs}ms`,
    motionBlurIntensity: `${global.intensity.toFixed(2)}`,
  };
}

export function applyMotionBlurTokensToDOM(
  rawConfig?: UnifiedMotionBlurConfig | Partial<PortfolioContent> | null
): void {
  if (typeof document === "undefined") return;

  const normConfig = normalizeMotionBlurConfig(rawConfig);
  const tokens = resolveMotionBlurTokens(normConfig);
  const root = document.documentElement;

  root.setAttribute("data-motion-blur", normConfig.enabled ? "true" : "false");
  root.style.setProperty("--motion-blur-enabled", tokens.motionBlurEnabled);
  root.style.setProperty("--motion-blur-preset", tokens.motionBlurPreset);
  root.style.setProperty("--motion-blur-radius", tokens.motionBlurRadius);
  root.style.setProperty("--motion-blur-duration", tokens.motionBlurDuration);
  root.style.setProperty("--motion-blur-intensity", tokens.motionBlurIntensity);
}

function clampNumber(val: number, min: number, max: number): number {
  if (isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}
