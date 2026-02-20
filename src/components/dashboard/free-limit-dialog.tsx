"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, ShieldAlert, Crown } from "lucide-react";

interface FreeLimitDialogProps {
  open: boolean;
  onClose: () => void;
  activeExposures: number;
  removalsUsed: number;
  limit: number;
}

export function FreeLimitDialog({
  open,
  onClose,
  activeExposures,
  removalsUsed,
  limit,
}: FreeLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        {/* Warning pulse */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent animate-pulse" />
        </div>

        <DialogHeader className="text-center relative">
          <div className="mx-auto mb-2 text-5xl">
            <Lock className="h-12 w-12 text-amber-400 mx-auto" />
          </div>
          <DialogTitle className="text-2xl text-amber-400">
            Removals Require an Upgrade
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-base mt-2">
            Data removals are available on Pro and Enterprise plans.
            {activeExposures > 0 && (
              <>
                {" "}Your data is exposed on{" "}
                <strong className="text-red-400">{activeExposures}</strong>{" "}
                source{activeExposures !== 1 ? "s" : ""} — upgrade to start removing it.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2 relative">
          {/* Risk info */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">
                Every day your data stays exposed, it can be sold to
                telemarketers, used for identity theft, or aggregated to build
                a complete profile of you.
              </p>
            </div>
          </div>

          {/* Pricing comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Pro</p>
              <p className="text-lg font-bold text-emerald-400">$9.99<span className="text-xs text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-1">Unlimited removals</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-emerald-600/50">
              <p className="text-xs text-emerald-400 mb-1 font-medium">Enterprise</p>
              <p className="text-lg font-bold text-emerald-400">$22.50<span className="text-xs text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-1">+ Dark web & family</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <Button
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-5"
              onClick={onClose}
            >
              <Link href="/dashboard/checkout?plan=PRO">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300"
              onClick={onClose}
            >
              Continue with Free Plan
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Your free scan shows where your data is exposed. Upgrade to remove it.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
