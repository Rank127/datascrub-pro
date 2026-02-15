/**
 * Shared URL Corrections Registry
 *
 * Known broken opt-out URLs and their correct replacements.
 * Used by link-checker, data-broker-directory, and admin endpoints.
 */

export const URL_CORRECTIONS: Record<string, string> = {
  "https://www.beenverified.com/opt-out/":
    "https://www.beenverified.com/app/optout/search",
  "https://www.peoplefinder.com/optout":
    "https://www.peoplefinder.com/manage",
  "https://privacy.openai.com/policies":
    "https://privacy.openai.com/policies?modal=take-control",
  "https://www.facebook.com/help/contact/540404257914453":
    "https://www.facebook.com/help/contact/367438723733209",
  "https://clearview.ai/privacy/requests":
    "https://clearview.ai/privacy-requests",
  "https://stability.ai/opt-out": "https://stability.ai/contact",
  "https://www.peekyou.com/about/contact/optout/":
    "https://www.peekyou.com/about/contact/optout",
};

/**
 * Common URL pattern variations to try when a link is broken.
 * Used by link-checker to auto-discover working URLs.
 */
export const URL_PATTERN_VARIATIONS = [
  "/optout",
  "/opt-out",
  "/privacy",
  "/removal",
  "/privacy/optout",
  "/privacy/opt-out",
  "/do-not-sell",
  "/suppress",
];

/**
 * Get corrected URL if one exists, otherwise return null.
 */
export function getCorrectedUrl(url: string): string | null {
  return URL_CORRECTIONS[url] || null;
}

/**
 * Apply URL correction if available, otherwise return the original.
 */
export function applyUrlCorrection(url: string): string {
  return URL_CORRECTIONS[url] || url;
}
