import type {
  GlassParams,
  GlassPreset,
  GlassTokens,
  PortfolioContent,
  ThemeTokens,
  UnifiedGlassConfig,
} from "./types";

export const GLASS_PRESETS: Record<Exclude<GlassPreset, "custom">, GlassParams> = {
  subtle: {
    intensity: 0.4,
    blur: 8,
    transparency: 0.75,
    borderStrength: 0.2,
    surfaceContrast: 0.4,
    shadowDepth: 0.3,
  },
  balanced: {
    intensity: 0.6,
    blur: 14,
    transparency: 0.6,
    borderStrength: 0.35,
    surfaceContrast: 0.6,
    shadowDepth: 0.5,
  },
  strong: {
    intensity: 0.85,
    blur: 20,
    transparency: 0.45,
    borderStrength: 0.5,
    surfaceContrast: 0.8,
    shadowDepth: 0.7,
  },
};

export const DEFAULT_UNIFIED_GLASS_CONFIG: UnifiedGlassConfig = {
  enabled: false,
  preset: "subtle",
  global: GLASS_PRESETS.subtle,
  sections: {},
  components: {},
};

export function normalizeGlassConfig(
  input?: Partial<UnifiedGlassConfig> | Partial<PortfolioContent> | null
): UnifiedGlassConfig {
  if (!input) return DEFAULT_UNIFIED_GLASS_CONFIG;

  const rawConfig = "glassConfig" in input ? input.glassConfig : (input as Partial<UnifiedGlassConfig>);
  if (!rawConfig || typeof rawConfig !== "object") return DEFAULT_UNIFIED_GLASS_CONFIG;

  const preset: GlassPreset =
    rawConfig.preset && ["subtle", "balanced", "strong", "custom"].includes(rawConfig.preset)
      ? rawConfig.preset
      : DEFAULT_UNIFIED_GLASS_CONFIG.preset;

  const defaultParams = preset !== "custom" ? GLASS_PRESETS[preset] : GLASS_PRESETS.subtle;
  const rawGlobal: Partial<GlassParams> = rawConfig.global || {};

  const globalParams: GlassParams = {
    intensity: clampNumber(rawGlobal.intensity ?? defaultParams.intensity, 0.1, 1),
    blur: Math.round(clampNumber(rawGlobal.blur ?? defaultParams.blur, 4, 24)),
    transparency: clampNumber(rawGlobal.transparency ?? defaultParams.transparency, 0.1, 0.95),
    borderStrength: clampNumber(rawGlobal.borderStrength ?? defaultParams.borderStrength, 0.05, 0.8),
    surfaceContrast: clampNumber(rawGlobal.surfaceContrast ?? defaultParams.surfaceContrast, 0.1, 1),
    shadowDepth: clampNumber(rawGlobal.shadowDepth ?? defaultParams.shadowDepth, 0.1, 1),
  };

  return {
    enabled: Boolean(rawConfig.enabled),
    preset,
    global: globalParams,
    sections: rawConfig.sections && typeof rawConfig.sections === "object" ? rawConfig.sections : {},
    components: rawConfig.components && typeof rawConfig.components === "object" ? rawConfig.components : {},
  };
}

export function resolveGlassTokens(
  themeTokens: ThemeTokens,
  glassConfig?: UnifiedGlassConfig | Partial<PortfolioContent> | null
): GlassTokens {
  const normConfig = normalizeGlassConfig(glassConfig);
  const { enabled, preset, global } = normConfig;

  if (!enabled) {
    return {
      glassEnabled: "0",
      glassBg: themeTokens.surface,
      glassBorder: `2px solid ${themeTokens.foreground}`,
      glassBlur: "0px",
      glassSaturation: "100%",
      glassShadow: "6px 6px 0 0 rgba(42, 36, 31, 0.15)",
      glassHighlight: "none",
      glassPreset: "off",
    };
  }

  // Convert theme surface color to RGBA based on transparency setting
  const surfaceRgba = hexToRgba(themeTokens.surface, global.transparency);
  
  // Border derived from foreground color with borderStrength alpha
  const borderRgba = hexToRgba(themeTokens.foreground, global.borderStrength);
  const borderThickness = Math.max(1, Math.round(global.borderStrength * 2.5));
  
  // Highlight derived from accent & surface brightness
  const highlightRgba = hexToRgba(themeTokens.accent, Math.min(0.4, global.surfaceContrast * 0.4));
  
  // Saturation scaling based on intensity
  const saturationVal = Math.round(110 + global.intensity * 40); // 115% - 150%
  
  // Shadow derived from foreground color with shadowDepth
  const shadowAlpha = 0.08 + global.shadowDepth * 0.18;
  const shadowOffset = Math.round(4 + global.shadowDepth * 8);

  return {
    glassEnabled: "1",
    glassBg: surfaceRgba,
    glassBorder: `${borderThickness}px solid ${borderRgba}`,
    glassBlur: `${global.blur}px`,
    glassSaturation: `${saturationVal}%`,
    glassShadow: `${shadowOffset}px ${shadowOffset}px 0 0 ${hexToRgba(themeTokens.foreground, shadowAlpha)}`,
    glassHighlight: `inset 0 1px 1px 0 ${highlightRgba}`,
    glassPreset: preset,
  };
}

export function applyGlassTokensToDOM(
  themeTokens: ThemeTokens,
  glassConfig?: UnifiedGlassConfig | Partial<PortfolioContent> | null
): void {
  if (typeof document === "undefined") return;

  const normConfig = normalizeGlassConfig(glassConfig);
  const tokens = resolveGlassTokens(themeTokens, normConfig);
  const root = document.documentElement;

  root.setAttribute("data-glass", normConfig.enabled ? "true" : "false");
  root.style.setProperty("--glass-enabled", tokens.glassEnabled);
  root.style.setProperty("--glass-bg", tokens.glassBg);
  root.style.setProperty("--glass-border", tokens.glassBorder);
  root.style.setProperty("--glass-blur", tokens.glassBlur);
  root.style.setProperty("--glass-saturation", tokens.glassSaturation);
  root.style.setProperty("--glass-shadow", tokens.glassShadow);
  root.style.setProperty("--glass-highlight", tokens.glassHighlight);
  root.style.setProperty("--glass-preset", tokens.glassPreset);
}

function clampNumber(val: number, min: number, max: number): number {
  if (isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex || !hex.startsWith("#")) return `rgba(42, 36, 31, ${alpha})`;
  const cleanHex = hex.replace("#", "");
  let r = 0,
    g = 0,
    b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}
