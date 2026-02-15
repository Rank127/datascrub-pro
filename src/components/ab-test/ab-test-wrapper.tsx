"use client";

import { useEffect, useState, ReactNode } from "react";

interface ABTestVariant {
  id: string;
  weight?: number;
  element: ReactNode;
}

interface ABTestProps {
  experimentId: string;
  variants: ABTestVariant[];
  fallback?: ReactNode;
}

export function ABTest({ experimentId, variants, fallback }: ABTestProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for existing assignment
    const storageKey = `ab_${experimentId}`;
    const existing = localStorage.getItem(storageKey);

    if (existing && variants.some(v => v.id === existing)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVariant(existing);
      return;
    }

    // Try PostHog feature flag first
    try {
      const posthog = (window as unknown as { posthog?: { getFeatureFlag?: (key: string) => string | undefined; capture?: (event: string, properties: Record<string, string>) => void } }).posthog;
      if (posthog?.getFeatureFlag) {
        const flag = posthog.getFeatureFlag(experimentId);
        if (flag && variants.some(v => v.id === flag)) {
          setSelectedVariant(flag as string);
          localStorage.setItem(storageKey, flag as string);
          posthog.capture?.("experiment_exposure", {
            experiment_id: experimentId,
            variant_id: flag,
          });
          return;
        }
      }
    } catch {
      // PostHog not available, fall through to random assignment
    }

    // Fallback: random assignment based on weights
    const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
    let random = Math.random() * totalWeight;
    for (const variant of variants) {
      random -= variant.weight || 1;
      if (random <= 0) {
        setSelectedVariant(variant.id);
        localStorage.setItem(storageKey, variant.id);
        try {
          const posthog = (window as unknown as { posthog?: { capture?: (event: string, properties: Record<string, string>) => void } }).posthog;
          posthog?.capture?.("experiment_exposure", {
            experiment_id: experimentId,
            variant_id: variant.id,
          });
        } catch {
          // PostHog not available, ignore
        }
        return;
      }
    }

    // Fallback to first variant
    setSelectedVariant(variants[0].id);
    localStorage.setItem(storageKey, variants[0].id);
  }, [experimentId, variants]);

  if (!selectedVariant) return fallback || null;

  const variant = variants.find(v => v.id === selectedVariant);
  return <>{variant?.element || fallback || null}</>;
}
