/**
 * Data Integrity Policy for URLs (Social links, Resume, external links)
 *
 * States:
 * - VALID: Non-empty valid URL provided by Admin CMS.
 * - INTENTIONALLY_DISABLED: Explicitly disabled or cleared by Admin ("disabled", "none", "off").
 * - MISSING: undefined or null.
 * - INVALID: Malformed URL or unsafe protocol (javascript:, data:, etc.).
 */

export type LinkState = "VALID" | "INTENTIONALLY_DISABLED" | "MISSING" | "INVALID";

export interface LinkResolution {
  state: LinkState;
  url: string | null;
  shouldDisplay: boolean;
}

const VERIFIED_FALLBACKS: Record<string, string> = {
  github: "https://github.com/rahulchakradhar30",
  linkedin: "https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/",
  instagram: "https://www.instagram.com/rahul_chakradhar_30/?hl=en",
};

/**
 * Validates whether a URL string is safe and properly formatted.
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Disallow dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;

  // Allow relative URLs, anchor hashes, mailto, tel
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Resolves a URL according to the Data Integrity Policy.
 * Does NOT mutate the database.
 */
export function resolveLink(
  adminValue: string | null | undefined,
  linkKey?: keyof typeof VERIFIED_FALLBACKS
): LinkResolution {
  // State 3: MISSING
  if (adminValue === undefined || adminValue === null) {
    const fallback = linkKey ? VERIFIED_FALLBACKS[linkKey] : null;
    return {
      state: "MISSING",
      url: fallback || null,
      shouldDisplay: Boolean(fallback),
    };
  }

  const trimmed = adminValue.trim();

  // State 2: INTENTIONALLY DISABLED
  if (trimmed === "" || trimmed.toLowerCase() === "disabled" || trimmed.toLowerCase() === "none" || trimmed.toLowerCase() === "off") {
    return {
      state: "INTENTIONALLY_DISABLED",
      url: null,
      shouldDisplay: false,
    };
  }

  // State 1: VALID
  if (isValidUrl(trimmed)) {
    return {
      state: "VALID",
      url: trimmed,
      shouldDisplay: true,
    };
  }

  // State 4: INVALID
  const fallback = linkKey ? VERIFIED_FALLBACKS[linkKey] : null;
  return {
    state: "INVALID",
    url: fallback || null,
    shouldDisplay: Boolean(fallback),
  };
}
