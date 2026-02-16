"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ConsentPreferences } from "./consent-utils";
import {
  hasPrivacySignal,
  readConsentCookie,
  writeConsentCookie,
} from "./consent-utils";

interface ConsentState {
  /** Effective consent after DNT/GPC override */
  effectiveConsent: ConsentPreferences;
  /** Whether the consent banner should be shown */
  showBanner: boolean;
  /** Whether the detailed preferences panel is open */
  showPreferences: boolean;
  /** Whether a privacy signal (DNT/GPC) was detected */
  privacySignalDetected: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: ConsentPreferences) => void;
  openSettings: () => void;
}

const DEFAULTS: ConsentPreferences = { analytics: false, marketing: false };

const ConsentContext = createContext<ConsentState>({
  effectiveConsent: DEFAULTS,
  showBanner: false,
  showPreferences: false,
  privacySignalDetected: false,
  acceptAll: () => {},
  rejectAll: () => {},
  savePreferences: () => {},
  openSettings: () => {},
});

interface InternalState {
  storedPrefs: ConsentPreferences | null;
  showBanner: boolean;
  showPreferences: boolean;
  privacySignalDetected: boolean;
  mounted: boolean;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InternalState>({
    storedPrefs: null,
    showBanner: false,
    showPreferences: false,
    privacySignalDetected: false,
    mounted: false,
  });

  // Sync with browser cookie + navigator on mount (external system read)
  useEffect(() => {
    const cookie = readConsentCookie();
    const signal = hasPrivacySignal();

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from browser cookies/navigator is an external system sync
    setState({
      storedPrefs: cookie,
      privacySignalDetected: signal,
      showBanner: cookie === null,
      showPreferences: false,
      mounted: true,
    });
  }, []);

  // DNT/GPC always overrides stored prefs
  const effectiveConsent = useMemo<ConsentPreferences>(() => {
    if (!state.mounted) return DEFAULTS;
    if (state.privacySignalDetected) return DEFAULTS;
    return state.storedPrefs ?? DEFAULTS;
  }, [state.mounted, state.privacySignalDetected, state.storedPrefs]);

  const persist = useCallback((prefs: ConsentPreferences) => {
    writeConsentCookie(prefs);
    setState((prev) => ({
      ...prev,
      storedPrefs: prefs,
      showBanner: false,
      showPreferences: false,
    }));
  }, []);

  const acceptAll = useCallback(() => {
    persist({ analytics: true, marketing: true });
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist({ analytics: false, marketing: false });
  }, [persist]);

  const savePreferences = useCallback(
    (prefs: ConsentPreferences) => {
      persist(prefs);
    },
    [persist],
  );

  const openSettings = useCallback(() => {
    setState((prev) => ({ ...prev, showBanner: true, showPreferences: true }));
  }, []);

  const value = useMemo<ConsentState>(
    () => ({
      effectiveConsent,
      showBanner: state.showBanner,
      showPreferences: state.showPreferences,
      privacySignalDetected: state.privacySignalDetected,
      acceptAll,
      rejectAll,
      savePreferences,
      openSettings,
    }),
    [
      effectiveConsent,
      state.showBanner,
      state.showPreferences,
      state.privacySignalDetected,
      acceptAll,
      rejectAll,
      savePreferences,
      openSettings,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent() {
  return useContext(ConsentContext);
}
