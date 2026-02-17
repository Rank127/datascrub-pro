"use client";

import { useState, useEffect, useMemo } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { useSubscription } from "@/hooks/useSubscription";
import { trackEvent } from "@/components/analytics/posthog-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FirstRemovalCelebration() {
  const { alerts, markAsRead } = useAlerts({ showToast: false });
  const { isFreePlan } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Find unread milestone alert
  const milestoneAlert = useMemo(
    () =>
      alerts.find(
        (a) => a.type === "FIRST_REMOVAL_MILESTONE" && !a.isRead
      ),
    [alerts]
  );

  const brokerName = useMemo(() => {
    if (!milestoneAlert?.metadata) return "a data broker";
    try {
      const meta = JSON.parse(milestoneAlert.metadata);
      return meta.brokerName || "a data broker";
    } catch {
      return "a data broker";
    }
  }, [milestoneAlert]);

  const isOpen = !!milestoneAlert && !dismissed;

  // Track PostHog event when modal is shown
  useEffect(() => {
    if (isOpen) {
      trackEvent("first_removal_completed", { brokerName });
    }
  }, [isOpen, brokerName]);

  function handleDismiss() {
    if (milestoneAlert) {
      markAsRead(milestoneAlert.id);
    }
    setDismissed(true);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        {/* Celebration pulse */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent animate-pulse" />
        </div>

        <DialogHeader className="text-center relative">
          <div className="mx-auto mb-2 text-5xl">&#127881;</div>
          <DialogTitle className="text-2xl text-emerald-400">
            Your First Data Removal!
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-base mt-2">
            Your personal data has been successfully removed from{" "}
            <strong className="text-white">{brokerName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2 relative">
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-slate-300">
              This means {brokerName} can no longer sell or share your personal
              information. We&apos;re working on removing your data from other brokers
              too — most process within 7-14 days.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {isFreePlan ? (
              <>
                <Button
                  asChild
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleDismiss}
                >
                  <Link href="/dashboard/billing">
                    Unlock Unlimited Removals
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300"
                  onClick={handleDismiss}
                >
                  Continue with Free Plan
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleDismiss}
              >
                <Link href="/dashboard/removals">View All Removals</Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
