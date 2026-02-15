"use client";

import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const ONBOARDING_KEY = "gmd-onboarding-completed";

const steps: Step[] = [
  {
    target: "body",
    content: "Welcome to GhostMyData! Let's show you around.",
    title: "Welcome",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="scan-nav"]',
    content:
      "Start here: Run your first privacy scan to discover where your data is exposed.",
    title: "Scan",
  },
  {
    target: '[data-tour="exposures-nav"]',
    content: "View all your discovered data exposures here.",
    title: "Exposures",
  },
  {
    target: '[data-tour="removals-nav"]',
    content: "Track the progress of your data removal requests.",
    title: "Removals",
  },
  {
    target: '[data-tour="settings-nav"]',
    content:
      "Customize your account, notifications, and security settings.",
    title: "Settings",
  },
];

export function OnboardingTour({ children }: { children: React.ReactNode }) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setRun(true);
    }
  }, []);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleCallback}
        styles={{
          options: {
            arrowColor: "#1e293b",
            backgroundColor: "#1e293b",
            overlayColor: "rgba(0, 0, 0, 0.75)",
            primaryColor: "#10b981",
            textColor: "#e2e8f0",
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
            padding: 20,
          },
          tooltipTitle: {
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 600,
          },
          tooltipContent: {
            color: "#cbd5e1",
            fontSize: 14,
            lineHeight: "1.6",
          },
          buttonNext: {
            backgroundColor: "#10b981",
            borderRadius: 8,
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 500,
            padding: "8px 16px",
          },
          buttonBack: {
            color: "#94a3b8",
            fontSize: 14,
            marginRight: 8,
          },
          buttonSkip: {
            color: "#64748b",
            fontSize: 13,
          },
          spotlight: {
            borderRadius: 8,
          },
          beacon: {
            display: "none",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip tour",
        }}
        floaterProps={{
          disableAnimation: true,
        }}
      />
      {children}
    </>
  );
}
