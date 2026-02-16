export const CONSENT_COOKIE_NAME = "cookie-consent";

/** Bump this when the cookie/privacy policy changes to re-prompt users */
export const CONSENT_VERSION = 1;

export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
}

interface StoredConsent extends ConsentPreferences {
  v: number;
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
      // Treat outdated consent versions as no consent (re-prompt)
      if (typeof parsed.v === "number" && parsed.v < CONSENT_VERSION) {
        return null;
      }
      return { analytics: parsed.analytics, marketing: parsed.marketing };
    }
    return null;
  } catch {
    return null;
  }
}

export function writeConsentCookie(prefs: ConsentPreferences): void {
  if (typeof document === "undefined") return;

  const stored: StoredConsent = { ...prefs, v: CONSENT_VERSION };
  const value = encodeURIComponent(JSON.stringify(stored));
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
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
