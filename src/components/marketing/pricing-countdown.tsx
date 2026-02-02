"use client";

import dynamic from "next/dynamic";

const CountdownTimer = dynamic(
  () => import("./countdown-timer").then(mod => ({ default: mod.CountdownTimer })),
  { ssr: false, loading: () => <div className="h-16" /> }
);

export function PricingCountdown() {
  return <CountdownTimer />;
}
