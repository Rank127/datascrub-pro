"use client";

import { useConsent } from "@/lib/consent/consent-context";

export function CookieSettingsButton() {
  const { openSettings } = useConsent();

  return (
    <button
      onClick={openSettings}
      className="hover:text-white text-left"
    >
      Cookie Settings
    </button>
  );
}
