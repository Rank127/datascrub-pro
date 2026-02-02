"use client";

import dynamic from "next/dynamic";

// Dynamic imports with ssr: false must be in a client component
const ExitIntentPopup = dynamic(
  () => import("./exit-intent-popup").then(mod => ({ default: mod.ExitIntentPopup })),
  { ssr: false }
);

const SocialProofNotifications = dynamic(
  () => import("./social-proof-notifications").then(mod => ({ default: mod.SocialProofNotifications })),
  { ssr: false }
);

const LiveChatWidget = dynamic(
  () => import("./live-chat-widget").then(mod => ({ default: mod.LiveChatWidget })),
  { ssr: false }
);

export function MarketingWidgets() {
  return (
    <>
      <ExitIntentPopup />
      <SocialProofNotifications />
      <LiveChatWidget />
    </>
  );
}
