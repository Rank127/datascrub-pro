"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: string;
  onCanceled: () => void;
}

const CANCEL_REASONS = [
  { id: "too_expensive", label: "Too expensive" },
  { id: "no_results", label: "Not seeing results" },
  { id: "competitor", label: "Using another service" },
  { id: "not_needed", label: "Don't need it anymore" },
  { id: "missing_features", label: "Missing features I need" },
  { id: "other", label: "Other" },
] as const;

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  plan,
  onCanceled,
}: CancelSubscriptionDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedReason(null);
    setOtherText("");
    setError(null);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleCancel = async () => {
    if (!selectedReason) return;

    const reason =
      selectedReason === "other" && otherText.trim()
        ? `Other: ${otherText.trim()}`
        : CANCEL_REASONS.find((r) => r.id === selectedReason)?.label || selectedReason;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to cancel subscription");
      }

      handleClose(false);
      onCanceled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Cancel {plan} Subscription</DialogTitle>
          <DialogDescription className="text-slate-400">
            We&apos;re sorry to see you go. Please let us know why you&apos;re canceling so we can improve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {CANCEL_REASONS.map((reason) => (
            <button
              key={reason.id}
              type="button"
              onClick={() => setSelectedReason(reason.id)}
              disabled={isLoading}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                selectedReason === reason.id
                  ? "border-emerald-500 bg-emerald-500/10 text-white"
                  : "border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500"
              }`}
            >
              {reason.label}
            </button>
          ))}

          {selectedReason === "other" && (
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Tell us more (optional)..."
              disabled={isLoading}
              rows={3}
              className="w-full mt-2 px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/30 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Keep Subscription
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || !selectedReason}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Canceling...
              </>
            ) : (
              "Confirm Cancel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
