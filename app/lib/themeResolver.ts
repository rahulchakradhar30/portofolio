import type { ThemeConfigItem, ThemeTokens, UnifiedThemeConfig, PortfolioContent, ThemeMode } from "./types";

export const PERMANENT_DEFAULT_THEME: ThemeConfigItem = {
  id: "paper-default",
  name: "Classic Paper (Permanent)",
  isPermanent: true,
  tokens: {
    background: "#fdfbf7",
    foreground: "#2a241f",
    surface: "#ffffff",
    surfaceStrong: "#f0e9dd",
    surfaceSoft: "#f7f3ea",
    accent: "#d94e33",
    accentStrong: "#b53e26",
    dotPattern: "#2a241f",
  },
};

export const MAX_CUSTOM_THEMES = 5;

export const DEFAULT_UNIFIED_THEME_CONFIG: UnifiedThemeConfig = {
  activeThemeId: PERMANENT_DEFAULT_THEME.id,
  themeMode: "paper",
  customThemes: [],
  spatialRoomConfig: {
    roomDarkness: 0.8,
    spotlightIntensity: 1.0,
    showRoomNavigation: true,
    enableParticles: true,
    materialPreset: "aluminium",
  },
};

export function normalizeThemeConfig(
  input?: Partial<UnifiedThemeConfig> | Partial<PortfolioContent> | null
): UnifiedThemeConfig {
  if (!input) return DEFAULT_UNIFIED_THEME_CONFIG;

  // Extract raw themeMode if present directly on themeConfig or top-level content
  let rawThemeMode: string | undefined = undefined;
  if ("themeMode" in input && typeof (input as Record<string, unknown>).themeMode === "string") {
    rawThemeMode = (input as Record<string, unknown>).themeMode as string;
  } else if ("themeConfig" in input && input.themeConfig && typeof input.themeConfig.themeMode === "string") {
    rawThemeMode = input.themeConfig.themeMode;
  }

  const themeMode: ThemeMode = rawThemeMode === "spatial" ? "spatial" : "paper";

  // Extract spatialRoomConfig if available
  const rawRoomConfig =
    ("spatialRoomConfig" in input && input.spatialRoomConfig)
      ? input.spatialRoomConfig
      : ("themeConfig" in input && input.themeConfig?.spatialRoomConfig)
      ? input.themeConfig.spatialRoomConfig
      : undefined;

  const spatialRoomConfig = {
    roomDarkness: rawRoomConfig?.roomDarkness ?? 0.8,
    spotlightIntensity: rawRoomConfig?.spotlightIntensity ?? 1.0,
    showRoomNavigation: rawRoomConfig?.showRoomNavigation !== false,
    enableParticles: rawRoomConfig?.enableParticles !== false,
    materialPreset: rawRoomConfig?.materialPreset || "aluminium",
  };

  if ("activeThemeId" in input && Array.isArray(input.customThemes)) {
    const validCustom = input.customThemes.slice(0, MAX_CUSTOM_THEMES).map((theme, index) => ({
      id: theme.id || `custom-theme-${index + 1}`,
      name: theme.name || `Custom Theme ${index + 1}`,
      isPermanent: false,
      tokens: {
        background: theme.tokens?.background || PERMANENT_DEFAULT_THEME.tokens.background,
        foreground: theme.tokens?.foreground || PERMANENT_DEFAULT_THEME.tokens.foreground,
        surface: theme.tokens?.surface || PERMANENT_DEFAULT_THEME.tokens.surface,
        surfaceStrong: theme.tokens?.surfaceStrong || PERMANENT_DEFAULT_THEME.tokens.surfaceStrong,
        surfaceSoft: theme.tokens?.surfaceSoft || PERMANENT_DEFAULT_THEME.tokens.surfaceSoft,
        accent: theme.tokens?.accent || PERMANENT_DEFAULT_THEME.tokens.accent,
        accentStrong: theme.tokens?.accentStrong || PERMANENT_DEFAULT_THEME.tokens.accentStrong,
        dotPattern: theme.tokens?.dotPattern || PERMANENT_DEFAULT_THEME.tokens.dotPattern,
      },
    }));

    return {
      activeThemeId: input.activeThemeId || PERMANENT_DEFAULT_THEME.id,
      themeMode,
      customThemes: validCustom,
      spatialRoomConfig,
    };
  }

  return {
    ...DEFAULT_UNIFIED_THEME_CONFIG,
    themeMode,
    spatialRoomConfig,
  };
}

export function getActiveThemeMode(rawConfig?: UnifiedThemeConfig | Partial<PortfolioContent> | null): ThemeMode {
  const config = normalizeThemeConfig(rawConfig);
  return config.themeMode || "paper";
}

export function getActiveTheme(rawConfig?: UnifiedThemeConfig | Partial<PortfolioContent> | null): ThemeConfigItem {
  const config = normalizeThemeConfig(rawConfig);
  if (config.activeThemeId === PERMANENT_DEFAULT_THEME.id) {
    return PERMANENT_DEFAULT_THEME;
  }

  const found = config.customThemes.find((t) => t.id === config.activeThemeId);
  return found || PERMANENT_DEFAULT_THEME;
}

export function applyThemeTokensToDOM(tokens: ThemeTokens): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--background", tokens.background);
  root.style.setProperty("--foreground", tokens.foreground);
  root.style.setProperty("--surface", tokens.surface);
  root.style.setProperty("--surface-strong", tokens.surfaceStrong);
  root.style.setProperty("--surface-soft", tokens.surfaceSoft);
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--accent-strong", tokens.accentStrong);
  root.style.setProperty("--border-thick", `2px solid ${tokens.foreground}`);
  root.style.setProperty("--border-thin", `1px solid ${hexToRgba(tokens.foreground, 0.2)}`);
  root.style.setProperty("--dot-pattern", tokens.dotPattern || tokens.foreground);
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex || !hex.startsWith("#")) return `rgba(42, 36, 31, ${alpha})`;
  const cleanHex = hex.replace("#", "");
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
