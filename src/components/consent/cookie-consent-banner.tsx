"use client";

import { useState } from "react";
import { useConsent } from "@/lib/consent/consent-context";
import type { ConsentPreferences } from "@/lib/consent/consent-utils";

export function CookieConsentBanner() {
  const {
    showBanner,
    showPreferences,
    privacySignalDetected,
    acceptAll,
    rejectAll,
    savePreferences,
    storedOrDefaults,
  } = useBannerState();

  const [localPrefs, setLocalPrefs] = useState<ConsentPreferences>({
    analytics: storedOrDefaults.analytics,
    marketing: storedOrDefaults.marketing,
  });

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] animate-slide-up">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 p-5 sm:p-6">
          {privacySignalDetected ? (
            <PrivacySignalNotice onDismiss={rejectAll} />
          ) : showPreferences ? (
            <PreferencesView
              prefs={localPrefs}
              onChange={setLocalPrefs}
              onSave={() => savePreferences(localPrefs)}
              onAcceptAll={acceptAll}
            />
          ) : (
            <SimpleView
              onAccept={acceptAll}
              onReject={rejectAll}
              onManage={() => {
                // handled via context openSettings — but we trigger preferences inline
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Hook that bridges consent context to banner-specific state */
function useBannerState() {
  const ctx = useConsent();
  return {
    showBanner: ctx.showBanner,
    showPreferences: ctx.showPreferences,
    privacySignalDetected: ctx.privacySignalDetected,
    acceptAll: ctx.acceptAll,
    rejectAll: ctx.rejectAll,
    savePreferences: ctx.savePreferences,
    openSettings: ctx.openSettings,
    storedOrDefaults: ctx.effectiveConsent,
  };
}

function SimpleView({
  onAccept,
  onReject,
}: {
  onAccept: () => void;
  onReject: () => void;
  onManage: () => void;
}) {
  const { openSettings } = useConsent();

  return (
    <>
      <p className="text-slate-300 text-sm sm:text-base mb-4">
        We use cookies to analyze site usage and improve our service. You can
        accept all cookies, reject non-essential ones, or customize your
        preferences.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAccept}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Accept All
        </button>
        <button
          onClick={onReject}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Reject All
        </button>
        <button
          onClick={openSettings}
          className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-medium underline underline-offset-2 transition-colors"
        >
          Manage Preferences
        </button>
      </div>
    </>
  );
}

function PreferencesView({
  prefs,
  onChange,
  onSave,
  onAcceptAll,
}: {
  prefs: ConsentPreferences;
  onChange: (p: ConsentPreferences) => void;
  onSave: () => void;
  onAcceptAll: () => void;
}) {
  return (
    <>
      <h3 className="text-white font-semibold text-base mb-4">
        Cookie Preferences
      </h3>

      <div className="space-y-3 mb-5">
        {/* Necessary — always on */}
        <label className="flex items-center justify-between">
          <div>
            <span className="text-slate-200 text-sm font-medium">
              Necessary
            </span>
            <p className="text-slate-500 text-xs">
              Login, security, and core functionality
            </p>
          </div>
          <ToggleSwitch checked disabled />
        </label>

        {/* Analytics */}
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-slate-200 text-sm font-medium">
              Analytics
            </span>
            <p className="text-slate-500 text-xs">
              Google Analytics, PostHog — anonymous usage data
            </p>
          </div>
          <ToggleSwitch
            checked={prefs.analytics}
            onChange={(v) => onChange({ ...prefs, analytics: v })}
          />
        </label>

        {/* Marketing */}
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-slate-200 text-sm font-medium">
              Marketing
            </span>
            <p className="text-slate-500 text-xs">
              Clarity, Meta Pixel, Google Ads — conversion tracking
            </p>
          </div>
          <ToggleSwitch
            checked={prefs.marketing}
            onChange={(v) => onChange({ ...prefs, marketing: v })}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSave}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Save Preferences
        </button>
        <button
          onClick={onAcceptAll}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Accept All
        </button>
      </div>
    </>
  );
}

function PrivacySignalNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <>
      <p className="text-slate-300 text-sm sm:text-base mb-3">
        We detected a <strong className="text-white">Do Not Track</strong> or{" "}
        <strong className="text-white">Global Privacy Control</strong> signal
        from your browser. Non-essential cookies are disabled automatically.
      </p>
      <p className="text-slate-500 text-xs mb-4">
        Only strictly necessary cookies (login, security) are active. No
        analytics or marketing scripts are loaded.
      </p>
      <button
        onClick={onDismiss}
        className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Got it
      </button>
    </>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors
        ${checked ? "bg-emerald-600" : "bg-slate-600"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      onClick={() => !disabled && onChange?.(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onChange?.(!checked);
        }
      }}
    >
      <span
        className={`
          inline-block h-4 w-4 rounded-full bg-white transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </span>
  );
}
