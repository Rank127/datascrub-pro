export const CONSENT_COOKIE_NAME = "cookie-consent";

export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
}

export function readConsentCookie(): ConsentPreferences | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!match) return null;

  try {
    const value = decodeURIComponent(match.split("=")[1]);
    const parsed = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean"
    ) {
      return parsed as ConsentPreferences;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeConsentCookie(prefs: ConsentPreferences): void {
  if (typeof document === "undefined") return;

  const value = encodeURIComponent(JSON.stringify(prefs));
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function hasPrivacySignal(): boolean {
  if (typeof navigator === "undefined") return false;

  const dnt = navigator.doNotTrack === "1";
  const gpc = !!(navigator as Navigator & { globalPrivacyControl?: boolean })
    .globalPrivacyControl;

  return dnt || gpc;
}

/** Check analytics consent without React context (for exported tracking functions) */
export function isAnalyticsConsented(): boolean {
  if (hasPrivacySignal()) return false;
  const prefs = readConsentCookie();
  return prefs?.analytics === true;
}

/** Check marketing consent without React context (for exported tracking functions) */
export function isMarketingConsented(): boolean {
  if (hasPrivacySignal()) return false;
  const prefs = readConsentCookie();
  return prefs?.marketing === true;
}
